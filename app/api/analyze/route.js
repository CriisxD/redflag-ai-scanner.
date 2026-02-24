import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');
    const bio = formData.get('bio') || '';
    const quizAnswers = formData.get('quizAnswers') ? JSON.parse(formData.get('quizAnswers')) : null;
    const breakupText = formData.get('breakupText') || '';

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const id = uuidv4();

    // Save image to uploads directory
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = imageFile.name?.split('.').pop() || 'jpg';
    const imagePath = path.join(uploadsDir, `${id}.${ext}`);
    fs.writeFileSync(imagePath, buffer);

    // Create DB record
    const { createScan } = require('@/lib/db');
    createScan({ id, imagePath, bio });

    // Start analysis in background (don't await)
    processAnalysis(id, buffer, bio, quizAnswers, breakupText).catch(console.error);

    return NextResponse.json({ id });
  } catch (err) {
    console.error('[Analyze] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function processAnalysis(id, imageBuffer, bio, quizAnswers, breakupText) {
  try {
    const { analyzeImage } = require('@/lib/openai');
    const { updateScanResult, updateScanError } = require('@/lib/db');

    const base64 = imageBuffer.toString('base64');
    const result = await analyzeImage(base64, bio, quizAnswers, breakupText);

    updateScanResult(id, {
      score: result.redFlagLevel,
      riskLabel: result.riskLevel,
      analysisJson: result,
    });
  } catch (err) {
    console.error('[Analysis] Failed:', err);
    const { updateScanError } = require('@/lib/db');
    updateScanError(id);
  }
}

const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch('http://localhost:3000/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetName: "Test User",
        images: ["dummy_base64_image_data"], // Just need something to pass validation
        context: { daysChatting: "3", hasMet: "Sí", userIntent: "Saber qué quiere" }
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();

'use client';

import { useState } from 'react';
import styles from './Quiz.module.css';

export default function Quiz({ questions, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleOptionSelect = (option) => {
    const updatedAnswers = { ...answers, [questions[currentStep].id]: option };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onComplete(updatedAnswers);
      }, 300);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <div className={styles.quizContainer}>
      <div className={styles.progressHeader}>
        <span className={styles.stepIndicator}>
          STEP {currentStep + 1} OF {questions.length}
        </span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={currentStep} className={styles.quizContent}>
        <h2 className={styles.questionTitle}>{currentQuestion.question}</h2>
        <div className={styles.optionsGrid}>
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              className={`${styles.optionButton} ${answers[currentQuestion.id] === option ? styles.selectedOption : ''}`}
              onClick={() => handleOptionSelect(option)}
            >
              <span>{option}</span>
              <div className={styles.optionCheck}>
                {answers[currentQuestion.id] === option && '✓'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

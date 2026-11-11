import React from 'react';
import { QuestionnaireWizard } from '@/components/questionnaire/QuestionnaireWizard';

export default function QuestionnairePage() {
  return (
    <div className="page space-y-6">
      <header className="max-w-3xl mx-auto space-y-1.5">
        <p className="t-eyebrow">Personalized Program</p>
        <h1 className="t-title">Let&apos;s personalize your training</h1>
        <p className="t-small max-w-xl">
          Answer a few quick questions to calibrate your split, volume, available equipment, and joint safety.
        </p>
      </header>

      <QuestionnaireWizard />
    </div>
  );
}

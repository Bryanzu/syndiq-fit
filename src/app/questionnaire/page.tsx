import React from 'react';
import { QuestionnaireWizard } from '@/components/questionnaire/QuestionnaireWizard';

export default function QuestionnairePage() {
  return (
    <div className="page space-y-6 pb-8 pt-1 sm:py-10">
      <header className="max-w-3xl mx-auto space-y-1.5">
        <p className="t-eyebrow">New program</p>
        <h1 className="t-large">Build your program</h1>
        <p className="t-small max-w-xl">
          Eight questions. About two minutes.
        </p>
      </header>

      <QuestionnaireWizard />
    </div>
  );
}

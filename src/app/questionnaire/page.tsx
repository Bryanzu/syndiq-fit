import React from 'react';
import { QuestionnaireWizard } from '@/components/questionnaire/QuestionnaireWizard';
import { Sparkles } from 'lucide-react';

export default function QuestionnairePage() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Top Heading */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gym-lime/10 border border-gym-lime/30 text-xs font-bold text-gym-lime">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PERSONALIZED PROGRAM GENERATOR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Build Your Workout Plan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Provide your profile details below. Syndiq fit will assemble a balanced, equipment-matched gym program for you.
          </p>
        </div>

        {/* Wizard Component */}
        <QuestionnaireWizard />
      </div>
    </div>
  );
}

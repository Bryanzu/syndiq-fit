import { WorkoutProgram } from '@/types/workout';

export async function generateWorkoutPdf(program: WorkoutProgram): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const profile = program.userProfile;

  // Helper function to check page overflow and add a new page
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
      renderPageHeader();
    }
  };

  const renderPageHeader = () => {
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(132, 204, 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SYNDIQ FIT | OFFICIAL WORKOUT PROGRAM', margin, 18);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text(program.name, pageWidth - margin, 18, { align: 'right' });
    y = Math.max(y, 45);
  };

  // --- COVER / HEADER ---
  // Background Header Block
  doc.setFillColor(15, 15, 15);
  doc.roundedRect(margin, y, contentWidth, 90, 8, 8, 'F');

  // Brand title
  doc.setTextColor(132, 204, 22); // Lime
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SYNDIQ FIT', margin + 20, y + 32);

  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PRECISION SCIENTIFIC WORKOUT PROGRAM', margin + 20, y + 46);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(program.name, margin + 20, y + 70);

  y += 105;

  // --- LIFTER PROFILE SECTION ---
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(margin, y, contentWidth, 55, 6, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(132, 204, 22);
  doc.text('MEMBER PROFILE', margin + 15, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(230, 230, 230);

  const col1 = `Lifter: ${profile.gender.toUpperCase()}, ${profile.age} yrs`;
  const col2 = `Experience: ${profile.experience.replace('_', ' ').toUpperCase()}`;
  const col3 = `Duration: ${profile.duration} Mins/Session`;
  const col4 = `Frequency: ${program.days.length} Days/Week`;

  doc.text(col1, margin + 15, y + 32);
  doc.text(col2, margin + 140, y + 32);
  doc.text(col3, margin + 290, y + 32);
  doc.text(col4, margin + 410, y + 32);

  // Injury disclaimer text if any
  if (profile.injuries && profile.injuries.length > 0 && !profile.injuries.includes('none')) {
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(8);
    doc.text(`Joint Adaptations: ${profile.injuries.join(', ')}`, margin + 15, y + 46);
  }

  y += 70;

  // --- DAYS & EXERCISES ---
  program.days.forEach((day) => {
    checkPageBreak(50);

    // Day Header Banner
    doc.setFillColor(132, 204, 22);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`DAY ${day.dayNumber}: ${day.title.toUpperCase()} (${day.exercises.length} Exercises, ~${day.estimatedDuration}m)`, margin + 12, y + 16);
    y += 32;

    day.exercises.forEach((item, exIdx) => {
      const ex = item.exercise;
      const boxHeight = 72;
      checkPageBreak(boxHeight + 8);

      // Exercise Item Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 5, 5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 5, 5, 'S');

      // Title & Equip
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${exIdx + 1}. ${ex.name}`, margin + 12, y + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${ex.equipment.toUpperCase()}]`, margin + 240, y + 16);

      // Prescription stats
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Sets: ${item.sets}   |   Reps: ${item.reps}   |   Rest: ${item.restSeconds}s`, margin + 12, y + 30);

      // Target Muscles
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const musclesStr = `Targets: ${ex.primaryMuscles.join(', ')} (Secondary: ${ex.secondaryMuscles.slice(0, 2).join(', ')})`;
      doc.text(musclesStr, margin + 12, y + 42);

      // Why / Instruction summary
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const coachText = doc.splitTextToSize(`Coach Rationale: ${ex.whyIncluded}`, contentWidth - 140);
      doc.text(coachText[0] || '', margin + 12, y + 54);

      // Clickable YouTube Demonstration Link
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.textWithLink('Watch Video Demo', pageWidth - margin - 105, y + 30, { url: ex.youtubeUrl });

      // If substituted
      if (item.isSubstituted) {
        doc.setTextColor(217, 119, 6);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`[Safety Adjusted]`, pageWidth - margin - 105, y + 44);
      }

      y += boxHeight + 8;
    });

    y += 10;
  });

  // --- FOOTER & DISCLAIMER ---
  checkPageBreak(50);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('HEALTH & SAFETY DISCLAIMER: This program is for general educational and fitness planning purposes.', margin + 10, y + 14);
  doc.text('Stop exercising immediately if you feel pain, dizziness, or sharp discomfort. Consult a physician before starting any new fitness regimen.', margin + 10, y + 26);
  doc.text(`Generated by Syndiq fit on ${new Date().toLocaleDateString()}`, margin + 10, y + 36);

  // Trigger browser download
  const safeTitle = program.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`syndiq_fit_${safeTitle}.pdf`);
}

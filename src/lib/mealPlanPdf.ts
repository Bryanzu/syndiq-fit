import { WeeklyMealPlan, ShoppingListItem } from '@/types/mealPlanner';

export async function generateMealPlanPdf(
  mealPlan: WeeklyMealPlan,
  shoppingList: ShoppingListItem[]
): Promise<void> {
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
    doc.text('SYNDIQ FIT | 7-DAY NIGERIAN MEAL PLAN & SHOPPING LIST', margin, 18);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('PRECISION SCIENTIFIC NUTRITION', pageWidth - margin, 18, { align: 'right' });
    y = Math.max(y, 45);
  };

  // --- COVER HEADER ---
  doc.setFillColor(15, 15, 15);
  doc.roundedRect(margin, y, contentWidth, 85, 8, 8, 'F');

  doc.setTextColor(132, 204, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SYNDIQ FIT', margin + 20, y + 30);

  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('7-DAY NIGERIAN MEAL PLAN & MARKET GUIDE', margin + 20, y + 44);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(
    `Target: ${mealPlan.profile.targetCalories} kcal / day • ${mealPlan.profile.targetProteinGrams}g Protein • Goal: ${mealPlan.profile.goal.replace(/_/g, ' ').toUpperCase()}`,
    margin + 20,
    y + 66
  );

  y += 100;

  // --- NUTRITION TARGET SUMMARY BLOCK ---
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(margin, y, contentWidth, 50, 6, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(132, 204, 22);
  doc.text('DAILY AVERAGE MACRO TARGETS', margin + 15, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(230, 230, 230);

  const col1 = `Target Energy: ${mealPlan.profile.targetCalories} kcal (Avg: ${mealPlan.averageDailyCalories} kcal)`;
  const col2 = `Target Protein: ${mealPlan.profile.targetProteinGrams}g (Avg: ${mealPlan.averageDailyProtein}g)`;
  const col3 = `Weight: ${mealPlan.profile.weightKg}kg • ${mealPlan.profile.mealsPerDay} Meals/Day`;

  doc.text(col1, margin + 15, y + 32);
  doc.text(col2, margin + 200, y + 32);
  doc.text(col3, margin + 370, y + 32);

  y += 65;

  // --- DAYS MEAL BREAKDOWN ---
  mealPlan.days.forEach((day) => {
    checkPageBreak(120);

    // Day Header
    doc.setFillColor(39, 39, 42);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(
      `DAY ${day.dayNumber}: ${day.dayName.toUpperCase()} — ${day.totalCalories} kcal • ${day.totalProtein}g Protein • ${day.totalCarbs}g Carbs • ${day.totalFat}g Fat`,
      margin + 10,
      y + 16
    );

    y += 30;

    // Meals in the day
    day.meals.forEach((meal) => {
      checkPageBreak(38);

      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin + 10, y, contentWidth - 20, 28, 3, 3, 'F');

      doc.setTextColor(10, 10, 10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const mealTypeBadge = meal.mealType.toUpperCase();
      doc.text(`[${mealTypeBadge}] ${meal.recipeName}`, margin + 18, y + 12);

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const ings = meal.ingredients.map((i) => i.displayAmount).join(' • ');
      doc.text(ings, margin + 18, y + 22, { maxWidth: contentWidth - 130 });

      // Macro badge
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${meal.calories} kcal | ${meal.protein}g P`, pageWidth - margin - 20, y + 17, { align: 'right' });

      y += 32;
    });

    y += 10;
  });

  // --- SHOPPING LIST PAGE ---
  doc.addPage();
  y = margin;
  renderPageHeader();

  doc.setFillColor(15, 15, 15);
  doc.roundedRect(margin, y, contentWidth, 36, 6, 6, 'F');
  doc.setTextColor(132, 204, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('7-DAY NIGERIAN MARKET SHOPPING LIST', margin + 15, y + 22);

  y += 48;

  const toBuyItems = shoppingList.filter((i) => i.toBuyQuantity > 0);

  toBuyItems.forEach((item) => {
    checkPageBreak(22);

    doc.setFillColor(item.isPurchased ? 230 : 248, item.isPurchased ? 230 : 248, item.isPurchased ? 230 : 248);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`[ ] ${item.foodName}`, margin + 10, y + 13);

    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(item.marketFormatRecommendation, margin + 160, y + 13, { maxWidth: contentWidth - 170 });

    y += 24;
  });

  // Save the PDF
  doc.save(`SyndiqFit_Nigerian_Meal_Plan_${Date.now()}.pdf`);
}

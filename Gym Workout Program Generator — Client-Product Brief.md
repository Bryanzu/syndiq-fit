# Gym Workout Program Generator

## 1. Project Overview

Build a full-fledged web application for creating personalized gym workout programs for gym members.

The purpose is to replace manually creating individual workout programs for every person who asks for one.

Instead of creating a new program from scratch each time, the application will collect information from the user and generate an appropriate workout program from a large library of pre-created workout templates/programs.

The application should work for **both males and females**.

The final result should feel like a proper fitness product, not just a form that outputs a list of exercises.

---

# 2. Main User Flow

The user visits the website and is guided through a simple questionnaire.

The application asks for information such as:

1. Age
2. Gender
3. Workout duration
4. Fitness goal
5. Injuries or physical limitations
6. Potentially fitness experience/level
7. Other information that may be useful for selecting an appropriate program

The application then uses those selections to determine the most appropriate workout program.

The program should be **balanced across the entire body**, even when the user selects a specific goal.

For example:

If someone selects:

> Goal: Bigger chest

The application should **not** generate a program consisting only of chest exercises.

Instead, chest development can be emphasized while still including:

- Back
- Shoulders
- Arms
- Legs
- Core
- Appropriate conditioning/cardio

The goal should influence the emphasis of the program, not completely eliminate other important areas.

---

# 3. Age Categories

The application should account for age when selecting a program.

Suggested categories:

- 20 and below
- 21–30
- 31–40
- 41–50
- 51–60
- 61+

These categories can be adjusted if research or program design suggests better groupings.

Age should influence exercise selection, volume, intensity, recovery requirements, and exercise complexity where appropriate.

---

# 4. Workout Duration

The user should select how much time they have available.

Options:

- 30 minutes
- 45 minutes
- 60 minutes
- 90 minutes
- 120 minutes

**Maximum workout duration: 2 hours.**

The application should ensure that the generated workout realistically fits within the selected time.

For example, a 30-minute program should not contain enough exercises to realistically take 90 minutes.

---

# 5. Gender

The application should support:

- Male
- Female

Gender should not result in completely separate exercise systems unless there is a legitimate programming reason.

Both genders should have access to comprehensive strength and fitness programs.

The main factors determining the program should be the user's:

- Goal
- Age
- Experience
- Available time
- Injuries/limitations
- Fitness level

---

# 6. Fitness Goals

The application should provide selectable goals.

Potential goals include:

### Body Composition
- Fat loss
- Muscle building
- Lean/toned physique
- General fitness

### Strength
- Build strength
- Improve overall strength
- Beginner strength

### Specific Emphasis
- Chest development
- Back development
- Shoulder development
- Arm development
- Leg development
- Glute development
- Core development

### General
- Improve fitness
- Improve endurance
- Maintain fitness
- Athletic performance

Important:

A selected goal should **influence the program rather than completely dictate it**.

For example:

> Goal: Bigger arms

The program could emphasize arms 2–3 times per week while still maintaining adequate lower-body, back, chest, shoulder and core training.

---

# 7. Injuries and Physical Limitations

The user should be asked whether they have any injuries or physical limitations.

Possible options include:

- No injury
- Shoulder
- Knee
- Lower back
- Hip
- Wrist
- Elbow
- Ankle
- Neck
- Other

There should also be an option to describe the issue.

Example:

> "I have pain in my right shoulder when pressing overhead."

The program selection system should then avoid or modify exercises that may be inappropriate for the stated limitation.

The system should include an appropriate disclaimer that the application is **not a medical diagnosis or substitute for professional medical advice**.

If a user reports serious pain, recent surgery, or a significant medical condition, the application should advise them to consult an appropriate healthcare professional before exercising.

---

# 8. Experience Level

Add an experience-level question because age and goal alone are not enough to determine an appropriate program.

Suggested options:

- Complete beginner
- Beginner
- Intermediate
- Advanced

This should affect:

- Exercise complexity
- Training volume
- Number of sets
- Exercise selection
- Intensity
- Progression

For example, a complete beginner should not automatically receive a program containing highly technical exercises simply because they selected muscle building.

---

# 9. Workout Program Library

Instead of relying on AI to invent every workout from scratch, the system should be based around a large library of **pre-created and reviewed workout programs/templates**.

Claude can initially be used to help create these programs.

The programs should be organized according to combinations of:

- Age
- Gender
- Goal
- Experience
- Workout duration
- Injury/limitation

The system then selects the most appropriate template and adapts it where necessary.

This approach should make the application more consistent than generating completely new workouts every time.

---

# 10. Program Structure

Every workout program should contain useful details rather than simply listing exercise names.

Each exercise should ideally include:

- Exercise name
- Target muscle/body part
- Sets
- Repetitions or time
- Rest period
- Recommended intensity where appropriate
- Exercise instructions
- Why the exercise is included
- Exercise video
- Alternative exercise where necessary

Example:

### Barbell Squat

**Sets:** 3  
**Reps:** 8–12  
**Rest:** 90 seconds

**Targets:** Quads, glutes, hamstrings and core

**Why:** Builds lower-body strength and muscle while training several major muscle groups.

**How to perform:**  
Short instructional explanation.

**Video:**  
YouTube demonstration link.

**Alternative:**  
Leg press / goblet squat depending on the user's level or limitations.

---

# 11. Full Workout View

After the user completes the questionnaire, the application should display a complete workout plan.

The page should look professional and easy to understand.

Possible structure:

## Your Personalized Workout Plan

**Age:** 27  
**Gender:** Male  
**Goal:** Muscle Building  
**Experience:** Beginner  
**Workout Time:** 60 minutes

### Day 1 — Chest, Shoulders & Triceps

Exercise 1  
Exercise 2  
Exercise 3  
Exercise 4  
Exercise 5

### Day 2 — Back & Biceps

Exercise 1  
Exercise 2  
Exercise 3  
Exercise 4

### Day 3 — Legs & Core

Exercise 1  
Exercise 2  
Exercise 3  
Exercise 4

etc.

The number of training days should depend on the selected program.

---

# 12. Body Visualization

The application should have a visually attractive representation of the human body.

For example, the interface could allow users to see:

- Chest
- Back
- Shoulders
- Biceps
- Triceps
- Forearms
- Abs
- Glutes
- Quads
- Hamstrings
- Calves

When an exercise is selected, the relevant muscle group could be highlighted.

This would help the user understand **what part of their body each exercise is targeting**.

---

# 13. Exercise Information

Clicking an exercise should open a detailed view.

Example:

## Dumbbell Bench Press

**Primary muscles:**
- Chest

**Secondary muscles:**
- Triceps
- Front shoulders

**Sets:** 3

**Reps:** 8–12

**Rest:** 60–90 seconds

### Why you're doing it

Explanation of why the exercise is included in the program.

### How to perform it

Simple step-by-step instructions.

### Watch demonstration

**Watch on YouTube →**

The YouTube link should open the relevant exercise demonstration.

---

# 14. Exercise Alternatives

The application should support exercise substitutions.

For example:

### Barbell Bench Press

Alternative:

- Dumbbell Bench Press
- Machine Chest Press
- Push-ups

This is particularly important for users with injuries, limited equipment, beginners, or people who are uncomfortable with certain exercises.

---

# 15. PDF Download

The user should be able to click:

> **Download Workout as PDF**

The application should generate a professionally formatted PDF containing their complete program.

The PDF should include:

- User's selected information
- Program overview
- Workout schedule
- Exercises
- Sets
- Reps
- Rest periods
- Exercise instructions
- Target muscles
- Why each exercise is included
- YouTube exercise links
- Safety/disclaimer information

The PDF should be clean enough for the user to save on their phone or print.

---

# 16. YouTube Exercise Links

Where appropriate, every exercise should have a YouTube demonstration link.

Example:

**Dumbbell Lateral Raise**

Watch demonstration:

> YouTube →

The link should also be included in the downloadable PDF.

Ideally, the system should use reliable exercise demonstrations rather than random videos.

---

# 17. Program Logic

The system should not simply match one answer to one workout.

It should consider multiple inputs together.

For example:

```text
Age: 45
Gender: Female
Experience: Beginner
Goal: Fat Loss
Workout Time: 60 minutes
Injury: Knee
```

The application should combine those factors to select an appropriate program.

Another user:

```text
Age: 25
Gender: Male
Experience: Intermediate
Goal: Muscle Building
Workout Time: 90 minutes
Injury: None
```

Should receive a different program.

---

# 18. Safety

The application should not present itself as a medical or diagnostic tool.

Include appropriate warnings such as:

- Stop exercising if you experience significant pain.
- Consult a qualified healthcare professional regarding injuries or medical conditions.
- The application provides general fitness programming.
- Exercise technique should be learned properly.
- Users should use appropriate weights and avoid sacrificing form to lift heavier loads.

---

# 19. Design Direction

The website should look like a modern fitness application.

It should be:

- Clean
- Professional
- Mobile-friendly
- Easy to navigate
- Fast
- Visually engaging
- Responsive on phones, tablets and computers

The primary user will likely access the application from a **mobile phone**, so mobile design is especially important.

---

# 20. Suggested Application Pages

### Home

Introduction to the workout platform.

### Create Your Program

The questionnaire.

### Your Program

The generated workout plan.

### Exercise Details

Detailed information for each exercise.

### Body/Muscle Map

Interactive body visualization.

### PDF

Download/print workout program.

### About

Information about the gym/program creator.

### Disclaimer

Fitness and medical disclaimer.

---

# 21. Future Features

The architecture should allow additional features to be added later.

Possible future features:

- User accounts
- Workout tracking
- Progress tracking
- Weight tracking
- Body measurements
- Progress photos
- Exercise history
- Workout completion tracking
- Automatic progression
- Notifications
- Weekly workout reminders
- Nutrition recommendations
- Calorie calculator
- Protein calculator
- Gym equipment selection
- Home workout mode
- Trainer/admin dashboard
- Multiple gyms
- Paid premium programs
- Subscription system

These do not necessarily need to be built in Version 1.

The first version should focus on producing a **high-quality personalized workout-program experience**.

---

# 22. Initial Program Creation Strategy

Before building the application, create a large structured database of workout programs.

Claude can be used to help create the initial program library.

The programs should be created systematically rather than randomly.

For example:

```text
Experience
├── Beginner
├── Intermediate
└── Advanced

Goal
├── Muscle Building
├── Fat Loss
├── Strength
├── General Fitness
└── Specific Emphasis

Duration
├── 30 min
├── 45 min
├── 60 min
├── 90 min
└── 120 min

Age
├── ≤20
├── 21–30
├── 31–40
├── 41–50
├── 51–60
└── 61+
```

The system should combine these dimensions intelligently rather than requiring a completely unique manually written program for every possible combination.

---

# 23. Important Design Principle

The application should **not simply be an AI chatbot that generates workouts.**

It should function more like a structured fitness programming system.

The AI can help create and organize the original exercise/program database, while the application uses defined rules to select and assemble appropriate programs.

This makes the results more:

- Consistent
- Predictable
- Testable
- Easier to maintain
- Easier to improve

---

# 24. Version 1 Goal

The first version should allow a gym member to:

1. Open the website.
2. Enter their information.
3. Select their goal.
4. Select their available workout time.
5. Enter injuries/limitations.
6. Select experience level.
7. Receive an appropriate full-body-balanced workout program.
8. View detailed exercise information.
9. See which muscles each exercise targets.
10. Watch exercise demonstrations through YouTube.
11. Download the complete program as a PDF.

The final product should feel like a **real gym workout-planning application**, rather than a simple form or static webpage.
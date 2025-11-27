-- Seed Data for Celline's OBGYN Prep
-- Run this after creating a demo user in Supabase Auth

-- Note: You must first create the demo user via Supabase Auth Dashboard or CLI:
-- Email: demo@celline.com
-- Password: password123
-- Then replace the USER_ID below with the actual UUID from auth.users

-- Placeholder for demo user ID (replace after creating user in Supabase Auth)
-- To find the user ID: SELECT id FROM auth.users WHERE email = 'demo@celline.com';

DO $$
DECLARE
  demo_user_id UUID;
  deck_id UUID;
BEGIN
  -- Get the demo user ID (must exist in auth.users first)
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@celline.com';
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found. Please create user demo@celline.com in Supabase Auth first.';
  END IF;

  -- Create the OBGYN High Yield deck
  INSERT INTO decks (id, user_id, title, created_at)
  VALUES (gen_random_uuid(), demo_user_id, 'OBGYN - High Yield', NOW())
  RETURNING id INTO deck_id;

  -- Card 1: Preeclampsia Diagnostic Criteria
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the diagnostic criteria for Preeclampsia?',
    '• Blood Pressure: ≥140/90 mmHg on two occasions at least 4 hours apart after 20 weeks gestation
• PLUS one of the following:
  - Proteinuria: ≥300 mg/24h OR protein/creatinine ratio ≥0.3 OR dipstick ≥2+
  - Thrombocytopenia: Platelets <100,000/μL
  - Renal insufficiency: Creatinine >1.1 mg/dL or doubling of baseline
  - Impaired liver function: Transaminases ≥2x upper normal
  - Pulmonary edema
  - New-onset headache or visual disturbances',
    0, 2.5, NOW()
  );

  -- Card 2: Severe Preeclampsia Features
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the criteria for Severe Preeclampsia (Preeclampsia with Severe Features)?',
    '• Systolic BP ≥160 mmHg OR Diastolic BP ≥110 mmHg (on two occasions at least 4 hours apart)
• Thrombocytopenia: Platelets <100,000/μL
• Liver transaminases ≥2x upper limit of normal
• Severe persistent RUQ or epigastric pain unresponsive to medication
• Renal insufficiency: Creatinine >1.1 mg/dL or doubling
• Pulmonary edema
• New-onset headache unresponsive to medication
• Visual disturbances

Note: Severe proteinuria (>5g/24h) is NO LONGER a criterion for severe preeclampsia (ACOG 2020)',
    0, 2.5, NOW()
  );

  -- Card 3: GDM Screening - WHO Criteria
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the WHO diagnostic thresholds for Gestational Diabetes Mellitus (75g OGTT)?',
    'WHO 2013 Criteria (One-Step Approach):
Diagnosis requires ONE or more values meeting threshold:

• Fasting: ≥92 mg/dL (5.1 mmol/L)
• 1-hour: ≥180 mg/dL (10.0 mmol/L)
• 2-hour: ≥153 mg/dL (8.5 mmol/L)

Timing: Performed at 24-28 weeks gestation
Preparation: Overnight fast of at least 8 hours',
    0, 2.5, NOW()
  );

  -- Card 4: GDM Screening - ACOG Two-Step
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the ACOG Two-Step screening thresholds for Gestational Diabetes?',
    'STEP 1: 50g Glucose Challenge Test (GCT) - Non-fasting
• Positive screen: ≥130-140 mg/dL at 1 hour (threshold varies by institution)

STEP 2: 100g OGTT (if GCT positive) - Fasting
Carpenter-Coustan Criteria (requires ≥2 abnormal values):
• Fasting: ≥95 mg/dL
• 1-hour: ≥180 mg/dL
• 2-hour: ≥155 mg/dL
• 3-hour: ≥140 mg/dL

NDDG Criteria (alternative, slightly higher thresholds):
• Fasting: ≥105 mg/dL
• 1-hour: ≥190 mg/dL
• 2-hour: ≥165 mg/dL
• 3-hour: ≥145 mg/dL',
    0, 2.5, NOW()
  );

  -- Card 5: Fetal Heart Rate Categories
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the three NICHD Categories for Fetal Heart Rate (FHR) interpretation?',
    'CATEGORY I (Normal) - All must be present:
• Baseline: 110-160 bpm
• Moderate variability (6-25 bpm)
• No late or variable decelerations
• Early decelerations: present or absent
• Accelerations: present or absent

CATEGORY II (Indeterminate):
• All tracings not Category I or III
• Examples: minimal variability, marked variability, absent accelerations, recurrent variable decels with moderate variability

CATEGORY III (Abnormal) - Either:
• Absent variability WITH recurrent late decels, recurrent variable decels, or bradycardia
• Sinusoidal pattern

Management: Category III requires immediate evaluation and intervention',
    0, 2.5, NOW()
  );

  -- Card 6: Pelvic Anatomy - Pelvic Diameters
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the key pelvic diameters and their normal measurements for vaginal delivery?',
    'PELVIC INLET:
• AP diameter (Obstetric conjugate): ≥10 cm
• Transverse diameter: ≥12 cm (widest)

MIDPELVIS:
• AP diameter: ≥11.5 cm
• Transverse (Interspinous): ≥10 cm (narrowest pelvic dimension)

PELVIC OUTLET:
• AP diameter: ≥9.5 cm
• Transverse (Intertuberous): ≥8 cm

Clinical Pearl: The interspinous diameter (10 cm) is the narrowest fixed bony diameter and most common site of arrest',
    0, 2.5, NOW()
  );

  -- Card 7: Bishop Score
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the components of the Bishop Score and what score indicates a favorable cervix?',
    'BISHOP SCORE COMPONENTS (0-3 points each):

| Factor      | 0      | 1       | 2       | 3      |
|-------------|--------|---------|---------|--------|
| Dilation    | Closed | 1-2 cm  | 3-4 cm  | ≥5 cm  |
| Effacement  | 0-30%  | 40-50%  | 60-70%  | ≥80%   |
| Station     | -3     | -2      | -1,0    | +1,+2  |
| Consistency | Firm   | Medium  | Soft    | -      |
| Position    | Post   | Mid     | Anterior| -      |

INTERPRETATION:
• Score ≥8: Favorable cervix, high success rate for induction
• Score <6: Unfavorable, consider cervical ripening
• Score 6-7: Intermediate',
    0, 2.5, NOW()
  );

  -- Card 8: HELLP Syndrome
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the diagnostic criteria for HELLP Syndrome?',
    'HELLP = Hemolysis, Elevated Liver enzymes, Low Platelets

DIAGNOSTIC CRITERIA:
• Hemolysis (one or more):
  - Abnormal peripheral smear (schistocytes, burr cells)
  - Total bilirubin >1.2 mg/dL
  - LDH >600 IU/L (or >2x upper normal)
  - Low haptoglobin

• Elevated Liver Enzymes:
  - AST ≥70 IU/L (or ≥2x upper normal)
  - LDH ≥600 IU/L

• Low Platelets:
  - <100,000/μL

CLASSIFICATION (Mississippi):
• Class 1: Platelets ≤50,000
• Class 2: Platelets 50,000-100,000
• Class 3: Platelets 100,000-150,000

Management: Delivery is definitive treatment; stabilize with magnesium and antihypertensives',
    0, 2.5, NOW()
  );

  -- Card 9: Magnesium Sulfate
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'What are the dosing, therapeutic levels, and toxicity signs for Magnesium Sulfate in preeclampsia?',
    'INDICATIONS: Seizure prophylaxis in severe preeclampsia/eclampsia

DOSING:
• Loading: 4-6 g IV over 15-20 minutes
• Maintenance: 1-2 g/hour continuous infusion

THERAPEUTIC LEVEL: 4-7 mEq/L (4.8-8.4 mg/dL)

TOXICITY PROGRESSION:
• 8-12 mEq/L: Loss of deep tendon reflexes
• 10-12 mEq/L: Respiratory depression
• 15-17 mEq/L: Respiratory arrest
• >25 mEq/L: Cardiac arrest

MONITORING:
• Deep tendon reflexes (hourly)
• Respiratory rate (>12/min)
• Urine output (>25-30 mL/hour)

ANTIDOTE: Calcium gluconate 1g IV over 3 minutes',
    0, 2.5, NOW()
  );

  -- Card 10: Fetal Lie, Presentation, and Position
  INSERT INTO cards (deck_id, front, back, interval, ease_factor, next_review)
  VALUES (
    deck_id,
    'Define Fetal Lie, Presentation, and Position. What is the most common position at delivery?',
    'FETAL LIE: Relationship of fetal spine to maternal spine
• Longitudinal (99%): Fetal spine parallel to maternal spine
• Transverse: Fetal spine perpendicular to maternal spine
• Oblique: Fetal spine at an angle

PRESENTATION: Fetal part entering pelvic inlet first
• Cephalic (96%): Head first
• Breech (3-4%): Buttocks/feet first
• Shoulder: Transverse lie

POSITION: Relationship of fetal presenting part to maternal pelvis
• Denominator for vertex: Occiput (O)
• Reference points: Left/Right, Anterior/Posterior/Transverse

MOST COMMON AT DELIVERY:
• Left Occiput Anterior (LOA) - most common
• Occiput Anterior (OA) - optimal for delivery

Clinical Pearl: Persistent Occiput Posterior (OP) associated with prolonged labor and operative delivery',
    0, 2.5, NOW()
  );

  RAISE NOTICE 'Successfully seeded deck with 10 OBGYN flashcards for user %', demo_user_id;
END $$;

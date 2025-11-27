/**
 * Database Seed Script for Celline's OBGYN Prep
 * 
 * This script creates a demo user and seeds the database with 10 high-yield
 * OBGYN flashcards for Specialist Entrance Exam preparation.
 * 
 * Usage: npm run seed
 * 
 * Prerequisites:
 * - Supabase project with schema.sql applied
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_EMAIL = 'demo@celline.com';
const DEMO_PASSWORD = 'password123';

interface Card {
  front: string;
  back: string;
}

const obgynCards: Card[] = [
  {
    front: 'What are the diagnostic criteria for Preeclampsia?',
    back: `• Blood Pressure: ≥140/90 mmHg on two occasions at least 4 hours apart after 20 weeks gestation
• PLUS one of the following:
  - Proteinuria: ≥300 mg/24h OR protein/creatinine ratio ≥0.3 OR dipstick ≥2+
  - Thrombocytopenia: Platelets <100,000/μL
  - Renal insufficiency: Creatinine >1.1 mg/dL or doubling of baseline
  - Impaired liver function: Transaminases ≥2x upper normal
  - Pulmonary edema
  - New-onset headache or visual disturbances`
  },
  {
    front: 'What are the criteria for Severe Preeclampsia (Preeclampsia with Severe Features)?',
    back: `• Systolic BP ≥160 mmHg OR Diastolic BP ≥110 mmHg (on two occasions at least 4 hours apart)
• Thrombocytopenia: Platelets <100,000/μL
• Liver transaminases ≥2x upper limit of normal
• Severe persistent RUQ or epigastric pain unresponsive to medication
• Renal insufficiency: Creatinine >1.1 mg/dL or doubling
• Pulmonary edema
• New-onset headache unresponsive to medication
• Visual disturbances

Note: Severe proteinuria (>5g/24h) is NO LONGER a criterion for severe preeclampsia (ACOG 2020)`
  },
  {
    front: 'What are the WHO diagnostic thresholds for Gestational Diabetes Mellitus (75g OGTT)?',
    back: `WHO 2013 Criteria (One-Step Approach):
Diagnosis requires ONE or more values meeting threshold:

• Fasting: ≥92 mg/dL (5.1 mmol/L)
• 1-hour: ≥180 mg/dL (10.0 mmol/L)
• 2-hour: ≥153 mg/dL (8.5 mmol/L)

Timing: Performed at 24-28 weeks gestation
Preparation: Overnight fast of at least 8 hours`
  },
  {
    front: 'What are the ACOG Two-Step screening thresholds for Gestational Diabetes?',
    back: `STEP 1: 50g Glucose Challenge Test (GCT) - Non-fasting
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
• 3-hour: ≥145 mg/dL`
  },
  {
    front: 'What are the three NICHD Categories for Fetal Heart Rate (FHR) interpretation?',
    back: `CATEGORY I (Normal) - All must be present:
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

Management: Category III requires immediate evaluation and intervention`
  },
  {
    front: 'What are the key pelvic diameters and their normal measurements for vaginal delivery?',
    back: `PELVIC INLET:
• AP diameter (Obstetric conjugate): ≥10 cm
• Transverse diameter: ≥12 cm (widest)

MIDPELVIS:
• AP diameter: ≥11.5 cm
• Transverse (Interspinous): ≥10 cm (narrowest pelvic dimension)

PELVIC OUTLET:
• AP diameter: ≥9.5 cm
• Transverse (Intertuberous): ≥8 cm

Clinical Pearl: The interspinous diameter (10 cm) is the narrowest fixed bony diameter and most common site of arrest`
  },
  {
    front: 'What are the components of the Bishop Score and what score indicates a favorable cervix?',
    back: `BISHOP SCORE COMPONENTS (0-3 points each):

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
• Score 6-7: Intermediate`
  },
  {
    front: 'What are the diagnostic criteria for HELLP Syndrome?',
    back: `HELLP = Hemolysis, Elevated Liver enzymes, Low Platelets

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

Management: Delivery is definitive treatment; stabilize with magnesium and antihypertensives`
  },
  {
    front: 'What are the dosing, therapeutic levels, and toxicity signs for Magnesium Sulfate in preeclampsia?',
    back: `INDICATIONS: Seizure prophylaxis in severe preeclampsia/eclampsia

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

ANTIDOTE: Calcium gluconate 1g IV over 3 minutes`
  },
  {
    front: 'Define Fetal Lie, Presentation, and Position. What is the most common position at delivery?',
    back: `FETAL LIE: Relationship of fetal spine to maternal spine
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

Clinical Pearl: Persistent Occiput Posterior (OP) associated with prolonged labor and operative delivery`
  }
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Step 1: Create or get demo user
  console.log(`📧 Creating demo user: ${DEMO_EMAIL}`);
  
  let userId: string;
  
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u: { email?: string }) => u.email === DEMO_EMAIL
  );
  
  if (existingUser) {
    console.log('   User already exists, using existing account');
    userId = existingUser.id;
  } else {
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true
    });

    if (userError) {
      console.error('❌ Failed to create user:', userError.message);
      process.exit(1);
    }
    
    userId = newUser.user.id;
    console.log('   ✅ User created successfully');
  }

  // Step 2: Check for existing deck
  console.log('\n📚 Creating deck: OBGYN - High Yield');
  
  const { data: existingDecks } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', userId)
    .eq('title', 'OBGYN - High Yield');

  let deckId: string;

  if (existingDecks && existingDecks.length > 0) {
    console.log('   Deck already exists, clearing existing cards...');
    deckId = existingDecks[0].id;
    
    // Delete existing cards in this deck
    await supabase.from('cards').delete().eq('deck_id', deckId);
  } else {
    const { data: newDeck, error: deckError } = await supabase
      .from('decks')
      .insert({ user_id: userId, title: 'OBGYN - High Yield' })
      .select('id')
      .single();

    if (deckError) {
      console.error('❌ Failed to create deck:', deckError.message);
      process.exit(1);
    }
    
    deckId = newDeck.id;
    console.log('   ✅ Deck created successfully');
  }

  // Step 3: Insert cards
  console.log('\n🃏 Inserting 10 OBGYN flashcards...');
  
  const cardsToInsert = obgynCards.map(card => ({
    deck_id: deckId,
    front: card.front,
    back: card.back,
    interval: 0,
    ease_factor: 2.5,
    next_review: new Date().toISOString()
  }));

  const { error: cardsError } = await supabase
    .from('cards')
    .insert(cardsToInsert);

  if (cardsError) {
    console.error('❌ Failed to insert cards:', cardsError.message);
    process.exit(1);
  }

  console.log('   ✅ All cards inserted successfully');

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ Seed completed successfully!\n');
  console.log('Demo Account:');
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log('\nDeck: OBGYN - High Yield (10 cards)');
  console.log('Topics covered:');
  console.log('   • Preeclampsia diagnostic criteria');
  console.log('   • Severe preeclampsia features');
  console.log('   • GDM screening (WHO & ACOG)');
  console.log('   • Fetal heart rate categories');
  console.log('   • Pelvic anatomy & diameters');
  console.log('   • Bishop Score');
  console.log('   • HELLP Syndrome');
  console.log('   • Magnesium sulfate dosing');
  console.log('   • Fetal lie, presentation & position');
  console.log('='.repeat(50));
}

seed().catch(console.error);

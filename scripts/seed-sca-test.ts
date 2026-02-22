/**
 * Seed Script: Standardized Cognitive Assessment (SCA)
 *
 * A psychometrically-structured cognitive assessment modeled after
 * established IQ test batteries (WAIS-V, Raven's, Cattell CFIT).
 *
 * 50 questions across 5 cognitive domains, ordered by difficulty tier.
 * Each domain has 10 questions: 2 easy, 2 below-avg, 2 average, 2 above-avg, 2 hard.
 *
 * Domains:
 *   1. Fluid Reasoning (Gf) — novel pattern recognition, series completion
 *   2. Working Memory (Gwm) — mental manipulation of sequences and information
 *   3. Processing Speed (Gs) — rapid identification and pattern matching
 *   4. Verbal Comprehension (Gc) — vocabulary, abstraction, verbal reasoning
 *   5. Quantitative Reasoning (Gq) — numerical patterns, arithmetic reasoning
 *
 * Scoring (provisional, pre-norming):
 *   Raw 45-50 → ~130+ IQ (Very Superior, top 2%)
 *   Raw 40-44 → ~120-129 IQ (Superior, top 9%)
 *   Raw 35-39 → ~110-119 IQ (High Average, top 25%)
 *   Raw 25-34 → ~90-109 IQ (Average, middle 50%)
 *   Raw 20-24 → ~80-89 IQ (Low Average)
 *   Raw 15-19 → ~70-79 IQ (Borderline)
 *   Raw 0-14  → ~<70 IQ
 *
 * Usage: npm run seed:sca
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface Question {
  stem: string
  options: string[]
  correct_index: number
  explanation: string
}

const questions: Question[] = [
  // ================================================================
  // DOMAIN 1: FLUID REASONING (10 questions, ascending difficulty)
  // ================================================================

  // FR-1 (Easy)
  {
    stem: 'What comes next? 2, 4, 6, 8, ___',
    options: ['9', '10', '12', '14'],
    correct_index: 1,
    explanation: 'Add 2 each time: 8 + 2 = 10.',
  },
  // FR-2 (Easy)
  {
    stem: 'What comes next? A, C, E, G, ___',
    options: ['H', 'I', 'J', 'K'],
    correct_index: 1,
    explanation: 'Skip one letter: A(b)C(d)E(f)G(h)I.',
  },
  // FR-3 (Below Avg)
  {
    stem: 'What comes next? 3, 6, 12, 24, ___',
    options: ['30', '36', '48', '96'],
    correct_index: 2,
    explanation: 'Each number doubles: 24 × 2 = 48.',
  },
  // FR-4 (Below Avg)
  {
    stem: 'What comes next? 1, 4, 9, 16, 25, ___',
    options: ['30', '33', '36', '49'],
    correct_index: 2,
    explanation: 'Perfect squares: 1², 2², 3², 4², 5², 6² = 36.',
  },
  // FR-5 (Average)
  {
    stem: 'What comes next? 2, 3, 5, 8, 13, 21, ___',
    options: ['26', '29', '34', '42'],
    correct_index: 2,
    explanation: 'Each number = sum of previous two: 13 + 21 = 34.',
  },
  // FR-6 (Average)
  {
    stem: 'What comes next? 1, 2, 6, 24, 120, ___',
    options: ['240', '480', '600', '720'],
    correct_index: 3,
    explanation: 'Factorials: 1!, 2!, 3!, 4!, 5!, 6! = 720.',
  },
  // FR-7 (Above Avg)
  {
    stem: 'Each number is the previous number multiplied by its position (starting from position 1). Sequence: 1, 2, 6, 24, 120. What is the 7th term?',
    options: ['720', '840', '5040', '7200'],
    correct_index: 2,
    explanation: 'This is factorial: 7! = 5040. Position 7: 720 × 7 = 5040.',
  },
  // FR-8 (Above Avg)
  {
    stem: 'What comes next? 1, 3, 7, 15, 31, ___',
    options: ['47', '55', '62', '63'],
    correct_index: 3,
    explanation: 'Pattern: (×2)+1. Each term = previous × 2 + 1. 31 × 2 + 1 = 63. Also: 2ⁿ - 1 series.',
  },
  // FR-9 (Hard)
  {
    stem: 'A sequence follows: each term = sum of squares of its digits from the previous term. Start: 85. What is the 4th term?',
    options: ['89', '145', '42', '4'],
    correct_index: 2,
    explanation: 'T1=85, T2=8²+5²=64+25=89, T3=8²+9²=64+81=145, T4=1²+4²+5²=1+16+25=42.',
  },
  // FR-10 (Hard)
  {
    stem: 'A rule transforms pairs: (2,3)→12, (4,5)→40, (3,7)→42, (6,2)→24. What does (5,4) produce?',
    options: ['36', '40', '45', '60'],
    correct_index: 1,
    explanation: 'Rule: a × b × 2. (5 × 4 × 2) = 40.',
  },

  // ================================================================
  // DOMAIN 2: WORKING MEMORY (10 questions, ascending difficulty)
  // ================================================================

  // WM-1 (Easy)
  {
    stem: 'Rearrange from smallest to largest: 7, 2, 9, 4. What is the third number?',
    options: ['4', '7', '9', '2'],
    correct_index: 1,
    explanation: 'Sorted: 2, 4, 7, 9. Third = 7.',
  },
  // WM-2 (Easy)
  {
    stem: 'Spell "HOUSE" backwards. What is the third letter?',
    options: ['U', 'S', 'O', 'E'],
    correct_index: 0,
    explanation: 'HOUSE → ESUOH. Third letter = U.',
  },
  // WM-3 (Below Avg)
  {
    stem: 'Start with 20. Subtract 3, then multiply by 2, then add 7. Result?',
    options: ['37', '41', '44', '47'],
    correct_index: 1,
    explanation: '20 - 3 = 17. 17 × 2 = 34. 34 + 7 = 41.',
  },
  // WM-4 (Below Avg)
  {
    stem: 'Sort these letters alphabetically: M, A, T, H, E. What is the resulting sequence?',
    options: ['AHEMT', 'AEHTM', 'AEHMT', 'AMETH'],
    correct_index: 2,
    explanation: 'Alphabetical: A, E, H, M, T → AEHMT.',
  },
  // WM-5 (Average)
  {
    stem: 'Numbers: 8, 3, 1, 6, 4, 9, 2. What is the sum of the second-largest and second-smallest numbers?',
    options: ['10', '11', '12', '14'],
    correct_index: 0,
    explanation: 'Sorted: 1, 2, 3, 4, 6, 8, 9. Second-smallest=2, second-largest=8. 2+8=10.',
  },
  // WM-6 (Average)
  {
    stem: 'Start at 100. Subtract 7, divide by 3, add 19, multiply by 2. What is the result?',
    options: ['96', '100', '102', '108'],
    correct_index: 1,
    explanation: '100-7=93. 93÷3=31. 31+19=50. 50×2=100.',
  },
  // WM-7 (Above Avg)
  {
    stem: 'Sequence: 4, 8, 2, 7, 1, 9, 3, 6. What is the sum of numbers at odd positions (1st, 3rd, 5th, 7th)?',
    options: ['10', '14', '18', '22'],
    correct_index: 0,
    explanation: '1st=4, 3rd=2, 5th=1, 7th=3. Sum=4+2+1+3=10.',
  },
  // WM-8 (Above Avg)
  {
    stem: 'Alphabetize: TIGER, APPLE, SEVEN, CHAIR, NORTH. Take the first letter of each in the new order. What do you get?',
    options: ['TACSN', 'ACSNT', 'ACNST', 'ACTSN'],
    correct_index: 2,
    explanation: 'Alphabetical: APPLE, CHAIR, NORTH, SEVEN, TIGER → A, C, N, S, T → ACNST.',
  },
  // WM-9 (Hard)
  {
    stem: 'Perform in sequence: 7 × 8 = A. A - 6 = B. B ÷ 5 = C. C + 17 = D. D × 3 = ?',
    options: ['81', '84', '87', '90'],
    correct_index: 0,
    explanation: 'A=56. B=56-6=50. C=50÷5=10. D=10+17=27. 27×3=81.',
  },
  // WM-10 (Hard)
  {
    stem: 'Given: PENCIL=6, DESK=4, NOTEBOOK=8, ERASER=6. The number represents letter count. What is PENCIL + NOTEBOOK - DESK?',
    options: ['8', '10', '14', '18'],
    correct_index: 1,
    explanation: 'PENCIL(6) + NOTEBOOK(8) - DESK(4) = 6 + 8 - 4 = 10.',
  },

  // ================================================================
  // DOMAIN 3: PROCESSING SPEED (10 questions, ascending difficulty)
  // Quick pattern recognition — designed to be solved fast
  // ================================================================

  // PS-1 (Easy)
  {
    stem: 'Which one is different? ○ ○ ○ □ ○',
    options: ['1st', '2nd', '4th', '5th'],
    correct_index: 2,
    explanation: 'The 4th symbol (□) is a square; all others are circles.',
  },
  // PS-2 (Easy)
  {
    stem: 'How many times does the letter "A" appear? "BANANA AND PAPAYA"',
    options: ['5', '6', '7', '8'],
    correct_index: 2,
    explanation: 'BANANA: B-A-N-A-N-A = 3 A\'s. AND: A-N-D = 1 A. PAPAYA: P-A-P-A-Y-A = 3 A\'s. Total: 3+1+3 = 7.',
  },
  // PS-3 (Below Avg)
  {
    stem: 'Which number pair does NOT follow the same rule? (3,9) (5,25) (4,16) (7,48)',
    options: ['(3,9)', '(5,25)', '(4,16)', '(7,48)'],
    correct_index: 3,
    explanation: 'The rule is x². 3²=9, 5²=25, 4²=16, but 7²=49≠48. (7,48) breaks the pattern.',
  },
  // PS-4 (Below Avg)
  {
    stem: 'Count the odd numbers: 14, 27, 36, 41, 52, 63, 78, 89, 90, 15',
    options: ['3', '4', '5', '6'],
    correct_index: 2,
    explanation: 'Odd numbers: 27, 41, 63, 89, 15 = 5 odd numbers.',
  },
  // PS-5 (Average)
  {
    stem: 'Which letter comes 5 positions after M in the alphabet?',
    options: ['Q', 'R', 'S', 'P'],
    correct_index: 1,
    explanation: 'M(13) + 5 = 18 = R.',
  },
  // PS-6 (Average)
  {
    stem: 'Find the one that doesn\'t belong: 121, 144, 169, __(196)__, 225, 250',
    options: ['121', '144', '196', '250'],
    correct_index: 3,
    explanation: 'All are perfect squares except 250. 11²=121, 12²=144, 13²=169, 14²=196, 15²=225. 250 is not a perfect square.',
  },
  // PS-7 (Above Avg)
  {
    stem: 'How many pairs sum to 10 in this list? 3, 7, 2, 8, 5, 5, 1, 9, 4, 6',
    options: ['3', '4', '5', '6'],
    correct_index: 2,
    explanation: 'Pairs: (3,7), (2,8), (5,5), (1,9), (4,6) = 5 pairs.',
  },
  // PS-8 (Above Avg)
  {
    stem: 'If A=1, B=2, C=3... Z=26, what is the value of C + A + T?',
    options: ['24', '26', '28', '30'],
    correct_index: 0,
    explanation: 'C=3, A=1, T=20. Sum = 3+1+20 = 24.',
  },
  // PS-9 (Hard)
  {
    stem: 'In the number 7,284,916,053 — how many digits are greater than the digit immediately to their right?',
    options: ['3', '4', '5', '6'],
    correct_index: 2,
    explanation: '7>2 ✓, 2<8 ✗, 8>4 ✓, 4<9 ✗, 9>1 ✓, 1<6 ✗, 6>0 ✓, 0<5 ✗, 5>3 ✓. Count: 5.',
  },
  // PS-10 (Hard)
  {
    stem: 'A 4-digit number uses digits 1-9 (no repeats). The first digit is three times the fourth. The second digit is the sum of the third and fourth. The third digit is one more than the fourth. What is the number?',
    options: ['6431', '9352', '6532', '9543'],
    correct_index: 2,
    explanation: 'Let 4th digit = x. Then 1st = 3x, 3rd = x+1, 2nd = (x+1)+x = 2x+1. Try x=2: 1st=6, 3rd=3, 2nd=5, 4th=2 → 6532. All digits unique. Confirmed.',
  },

  // ================================================================
  // DOMAIN 4: VERBAL COMPREHENSION (10 questions, ascending difficulty)
  // ================================================================

  // VC-1 (Easy)
  {
    stem: 'DOCTOR is to HOSPITAL as TEACHER is to:',
    options: ['Student', 'School', 'Book', 'Education'],
    correct_index: 1,
    explanation: 'A doctor works in a hospital. A teacher works in a school.',
  },
  // VC-2 (Easy)
  {
    stem: 'Which word means the opposite of "ANCIENT"?',
    options: ['Old', 'Modern', 'Historic', 'Antique'],
    correct_index: 1,
    explanation: 'Ancient means very old. Modern means current/new — the direct opposite.',
  },
  // VC-3 (Below Avg)
  {
    stem: 'FIRE is to ASH as EXPLODE is to:',
    options: ['Bomb', 'Debris', 'Sound', 'Fire'],
    correct_index: 1,
    explanation: 'Fire leaves ash as remnant. Explosion leaves debris as remnant.',
  },
  // VC-4 (Below Avg)
  {
    stem: '"Despite his _____ demeanor, he was actually quite anxious." Choose the best fit:',
    options: ['Nervous', 'Calm', 'Frantic', 'Transparent'],
    correct_index: 1,
    explanation: '"Despite" signals contrast. Anxious inside → calm demeanor outside.',
  },
  // VC-5 (Average)
  {
    stem: 'What does "ubiquitous" mean?',
    options: ['Extremely rare', 'Found everywhere', 'Difficult to understand', 'Having multiple meanings'],
    correct_index: 1,
    explanation: 'Ubiquitous = present everywhere. Smartphones are ubiquitous in modern life.',
  },
  // VC-6 (Average)
  {
    stem: 'Which pair shares the same relationship as SYMPHONY : COMPOSER?',
    options: ['Book : Library', 'Painting : Museum', 'Novel : Author', 'Song : Radio'],
    correct_index: 2,
    explanation: 'Composer creates symphony. Author creates novel. Creator → creation relationship.',
  },
  // VC-7 (Above Avg)
  {
    stem: 'TELESCOPE : DISTANT :: MICROSCOPE : ___',
    options: ['Large', 'Invisible', 'Minute', 'Bright'],
    correct_index: 2,
    explanation: 'Telescope reveals distant things. Microscope reveals minute (tiny) things.',
  },
  // VC-8 (Above Avg)
  {
    stem: '"The politician\'s speech was lauded for its brevity." What does "brevity" mean?',
    options: ['Emotional power', 'Detailed analysis', 'Concise shortness', 'Loud delivery'],
    correct_index: 2,
    explanation: 'Brevity = briefness, being concise. The speech was praised for being short and to the point.',
  },
  // VC-9 (Hard)
  {
    stem: 'Choose the word that fits: "The researcher\'s _____ approach to the problem yielded insights that more conventional methods had missed."',
    options: ['Orthodox', 'Heterodox', 'Superficial', 'Redundant'],
    correct_index: 1,
    explanation: 'Heterodox = unorthodox, departing from accepted beliefs. It contrasts with "conventional methods," making it the right fit.',
  },
  // VC-10 (Hard)
  {
    stem: 'OBFUSCATE is to CLARITY as EXACERBATE is to:',
    options: ['Improvement', 'Worsening', 'Confusion', 'Resolution'],
    correct_index: 0,
    explanation: 'Obfuscate destroys clarity. Exacerbate destroys improvement (makes things worse, opposing improvement). Both verbs negate/undermine their paired noun.',
  },

  // ================================================================
  // DOMAIN 5: QUANTITATIVE REASONING (10 questions, ascending difficulty)
  // ================================================================

  // QR-1 (Easy)
  {
    stem: 'A shirt costs Rp 100,000. It is 50% off. What do you pay?',
    options: ['Rp 25,000', 'Rp 50,000', 'Rp 75,000', 'Rp 150,000'],
    correct_index: 1,
    explanation: '50% of 100,000 = 50,000.',
  },
  // QR-2 (Easy)
  {
    stem: 'If 3 apples cost Rp 15,000, how much do 5 apples cost?',
    options: ['Rp 18,000', 'Rp 20,000', 'Rp 25,000', 'Rp 30,000'],
    correct_index: 2,
    explanation: 'One apple = 15,000 ÷ 3 = 5,000. Five apples = 5,000 × 5 = 25,000.',
  },
  // QR-3 (Below Avg)
  {
    stem: 'A car travels at 60 km/h for 2.5 hours. How far does it go?',
    options: ['120 km', '150 km', '180 km', '200 km'],
    correct_index: 1,
    explanation: 'Distance = Speed × Time = 60 × 2.5 = 150 km.',
  },
  // QR-4 (Below Avg)
  {
    stem: 'The ratio of boys to girls in a class is 3:2. If there are 30 students, how many boys?',
    options: ['12', '15', '18', '20'],
    correct_index: 2,
    explanation: 'Total parts = 3+2 = 5. Each part = 30÷5 = 6. Boys = 3×6 = 18.',
  },
  // QR-5 (Average)
  {
    stem: 'A shirt costs Rp 200,000 after a 20% discount. What was the original price?',
    options: ['Rp 220,000', 'Rp 240,000', 'Rp 250,000', 'Rp 260,000'],
    correct_index: 2,
    explanation: '80% of original = 200,000. Original = 200,000 ÷ 0.80 = 250,000.',
  },
  // QR-6 (Average)
  {
    stem: 'If 4 workers can build a wall in 12 days, how many days for 6 workers?',
    options: ['6', '8', '10', '16'],
    correct_index: 1,
    explanation: 'Work = 4 × 12 = 48 worker-days. 48 ÷ 6 = 8 days.',
  },
  // QR-7 (Above Avg)
  {
    stem: 'A company grew revenue from Rp 800M to Rp 1,000M, then to Rp 1,300M. What is the average annual growth rate?',
    options: ['25%', '27.5%', '30%', '31.25%'],
    correct_index: 1,
    explanation: 'Year 1: (1000-800)/800 = 25%. Year 2: (1300-1000)/1000 = 30%. Average = (25%+30%)/2 = 27.5%.',
  },
  // QR-8 (Above Avg)
  {
    stem: 'You invest Rp 10,000,000 at 10% compound interest annually. What is the total after 3 years?',
    options: ['Rp 13,000,000', 'Rp 13,100,000', 'Rp 13,310,000', 'Rp 13,500,000'],
    correct_index: 2,
    explanation: 'Year 1: 11,000,000. Year 2: 12,100,000. Year 3: 13,310,000. Formula: 10M × 1.1³ = 13,310,000.',
  },
  // QR-9 (Hard)
  {
    stem: 'A tank fills via pipe A in 6 hours and pipe B in 4 hours. A drain empties it in 12 hours. If all three operate together, how long to fill the tank?',
    options: ['2 hours', '2.4 hours', '3 hours', '3.6 hours'],
    correct_index: 2,
    explanation: 'Rate A=1/6, Rate B=1/4, Drain=-1/12. Combined: 1/6+1/4-1/12 = 2/12+3/12-1/12 = 4/12 = 1/3. Time = 3 hours.',
  },
  // QR-10 (Hard)
  {
    stem: 'A cube has edges of length 3 cm. An ant walks from one corner to the diagonally opposite corner along the surface. What is the shortest path length?',
    options: ['3√5 cm', '3√2 + 3 cm', '6√2 cm', '3(1+√2) cm'],
    correct_index: 0,
    explanation: 'Unfold the cube: shortest surface path = √(3² + 6²) = √(9+36) = √45 = 3√5 ≈ 6.71 cm. This is found by unfolding two adjacent faces into a rectangle of 3×6.',
  },
]

// ============================================
// Seed Logic
// ============================================

async function seed() {
  console.log('Seeding Standardized Cognitive Assessment (SCA) for GIS...\n')

  // 1. Get GIS org
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'gis')
    .single()

  if (orgError || !org) {
    console.error('GIS org not found. Run `npm run seed` first.')
    process.exit(1)
  }
  console.log(`   Found GIS org: ${org.id}`)

  // 2. Get admin user
  const { data: adminMembers } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('org_id', org.id)
    .eq('role', 'owner')
    .limit(1)

  if (!adminMembers || adminMembers.length === 0) {
    console.error('No owner found for GIS org.')
    process.exit(1)
  }
  const userId = adminMembers[0].user_id
  console.log(`   Found admin user: ${userId}`)

  // 3. Create or update deck template
  const DECK_TITLE = 'Standardized Cognitive Assessment (SCA)'

  const { data: existingDeck } = await supabase
    .from('deck_templates')
    .select('id')
    .eq('org_id', org.id)
    .eq('title', DECK_TITLE)
    .single()

  let deckId: string

  if (existingDeck) {
    console.log(`   Deck "${DECK_TITLE}" exists, refreshing cards...`)
    deckId = existingDeck.id
    await supabase.from('card_templates').delete().eq('deck_template_id', deckId)
  } else {
    const { data: newDeck, error } = await supabase
      .from('deck_templates')
      .insert({
        title: DECK_TITLE,
        description: 'A psychometrically-structured cognitive assessment measuring 5 domains: Fluid Reasoning, Working Memory, Processing Speed, Verbal Comprehension, and Quantitative Reasoning. 50 questions ordered by difficulty.',
        subject: 'Cognitive Assessment',
        visibility: 'private',
        author_id: userId,
        org_id: org.id,
      })
      .select('id')
      .single()

    if (error || !newDeck) {
      console.error('Failed to create deck:', error?.message)
      process.exit(1)
    }
    deckId = newDeck.id
    console.log(`   Created deck: ${deckId}`)
  }

  // 4. Insert all 50 card templates
  const cardsToInsert = questions.map((q) => ({
    deck_template_id: deckId,
    stem: q.stem,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
  }))

  const { error: cardsError } = await supabase
    .from('card_templates')
    .insert(cardsToInsert)

  if (cardsError) {
    console.error('Failed to insert cards:', cardsError.message)
    process.exit(1)
  }
  console.log(`   Inserted ${questions.length} questions (5 domains × 10)`)

  // 5. Create or update assessment
  const ASSESSMENT_TITLE = 'Standardized Cognitive Assessment (SCA)'
  const DESCRIPTION = `A rigorous cognitive assessment measuring five core mental abilities:

• Fluid Reasoning — Pattern recognition and novel problem solving
• Working Memory — Mental manipulation and held information
• Processing Speed — Rapid identification and matching
• Verbal Comprehension — Vocabulary and abstract relationships
• Quantitative Reasoning — Numerical logic and arithmetic

50 questions, 40 minutes. Questions are ordered by difficulty within each domain.
No going back. One attempt only. This is the real deal.

PROVISIONAL SCORING (pre-norming):
  45-50 correct → ~130+ IQ (Very Superior, top 2%)
  40-44 correct → ~120-129 IQ (Superior, top 9%)
  35-39 correct → ~110-119 IQ (High Average)
  25-34 correct → ~90-109 IQ (Average)
  20-24 correct → ~80-89 IQ (Low Average)
  15-19 correct → ~70-79 IQ (Borderline)
  0-14 correct  → Below 70

Note: These ranges are provisional estimates. Actual IQ scoring requires norming against a large population sample. Your percentile rank (shown after completion) is the most reliable measure.`

  const { data: existingAssessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('org_id', org.id)
    .eq('title', ASSESSMENT_TITLE)
    .single()

  if (existingAssessment) {
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        deck_template_id: deckId,
        description: DESCRIPTION,
        time_limit_minutes: 40,
        pass_score: 0,
        question_count: 50,
        shuffle_questions: false,
        shuffle_options: false,
        show_results: true,
        max_attempts: 1,
        allow_review: false,
        status: 'published',
      })
      .eq('id', existingAssessment.id)

    if (updateError) {
      console.error('Failed to update assessment:', updateError.message)
      process.exit(1)
    }
    console.log(`   Updated assessment: ${existingAssessment.id}`)
  } else {
    const { data: newAssessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        org_id: org.id,
        deck_template_id: deckId,
        title: ASSESSMENT_TITLE,
        description: DESCRIPTION,
        time_limit_minutes: 40,
        pass_score: 0,
        question_count: 50,
        shuffle_questions: false,
        shuffle_options: false,
        show_results: true,
        max_attempts: 1,
        allow_review: false,
        status: 'published',
        created_by: userId,
      })
      .select('id')
      .single()

    if (assessmentError || !newAssessment) {
      console.error('Failed to create assessment:', assessmentError?.message)
      process.exit(1)
    }
    console.log(`   Created assessment: ${newAssessment.id}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('SCA Seed Complete!')
  console.log('')
  console.log('Deck:        Standardized Cognitive Assessment (SCA)')
  console.log('Questions:   50 (5 domains × 10, difficulty-ordered)')
  console.log('Assessment:  Published, 40 min, no pass/fail, 1 attempt')
  console.log('Shuffle:     OFF (difficulty progression matters)')
  console.log('Review:      OFF (standardized — no going back)')
  console.log('Org:         GIS (gis)')
  console.log('')
  console.log('Domains:')
  console.log('  1. Fluid Reasoning (Q1-10)')
  console.log('  2. Working Memory (Q11-20)')
  console.log('  3. Processing Speed (Q21-30)')
  console.log('  4. Verbal Comprehension (Q31-40)')
  console.log('  5. Quantitative Reasoning (Q41-50)')
  console.log('')
  console.log('Login:       admin@gis.cekatan.com / password123')
  console.log('='.repeat(60))
}

seed().catch(console.error)

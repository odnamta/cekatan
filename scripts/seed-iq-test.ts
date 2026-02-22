/**
 * Seed Script: General Cognitive Ability Test
 *
 * Seeds a 40-question IQ/cognitive ability test under the GIS org.
 * Creates deck_template + card_templates + published assessment.
 *
 * Usage: npm run seed:iq
 *
 * Prerequisites:
 * - Supabase project with schema applied
 * - GIS org already seeded (run `npm run seed` first)
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
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

// ============================================
// Questions — 40 MCQs across 4 categories
// ============================================

interface Question {
  stem: string
  options: string[]
  correct_index: number
  explanation: string
}

// ---------- VERBAL REASONING (10) ----------
const verbalQuestions: Question[] = [
  {
    stem: 'BOOK is to SHELF as CLOTHES is to:',
    options: ['Hanger', 'Closet', 'Laundry', 'Fabric'],
    correct_index: 1,
    explanation: 'A book is stored on a shelf. Clothes are stored in a closet. Both represent the primary storage location for the item.',
  },
  {
    stem: 'Choose the word that best completes: "The scientist\'s findings were so _____ that even her critics had to acknowledge them."',
    options: ['Ambiguous', 'Compelling', 'Tentative', 'Obsolete'],
    correct_index: 1,
    explanation: '"Compelling" means convincingly powerful — strong enough to force acknowledgment even from critics.',
  },
  {
    stem: 'SYMPHONY is to COMPOSER as NOVEL is to:',
    options: ['Reader', 'Publisher', 'Author', 'Library'],
    correct_index: 2,
    explanation: 'A composer creates a symphony. An author creates a novel. The relationship is creator to creation.',
  },
  {
    stem: 'Which word is most OPPOSITE in meaning to "VERBOSE"?',
    options: ['Elaborate', 'Concise', 'Loud', 'Written'],
    correct_index: 1,
    explanation: 'Verbose means using more words than necessary. Concise means expressing much in few words — the direct opposite.',
  },
  {
    stem: 'If "EPHEMERAL" means lasting a very short time, which sentence uses it correctly?',
    options: [
      'The ephemeral mountain stood for millions of years.',
      'Her ephemeral beauty lasted well into old age.',
      'The ephemeral rainbow faded within minutes.',
      'He built an ephemeral fortress of solid stone.',
    ],
    correct_index: 2,
    explanation: 'A rainbow that fades within minutes is short-lived (ephemeral). The other options describe permanent things, contradicting the meaning.',
  },
  {
    stem: 'TELESCOPE : DISTANT :: MICROSCOPE : ?',
    options: ['Large', 'Tiny', 'Bright', 'Dark'],
    correct_index: 1,
    explanation: 'A telescope helps see distant things. A microscope helps see tiny things. Both instruments enhance vision of otherwise hard-to-see subjects.',
  },
  {
    stem: 'Which pair of words has the same relationship as FIRE : ASH?',
    options: ['Rain : Cloud', 'Eat : Hunger', 'Explode : Debris', 'Plant : Seed'],
    correct_index: 2,
    explanation: 'Fire produces ash as a byproduct/remnant. Explode produces debris as a byproduct/remnant. Both show cause → leftover result.',
  },
  {
    stem: '"Despite his _____ demeanor, he was actually quite anxious inside." Choose the best fit:',
    options: ['Nervous', 'Calm', 'Frantic', 'Transparent'],
    correct_index: 1,
    explanation: '"Despite" signals contrast. If he was anxious inside, his outward demeanor must have been calm — the opposite of what he felt.',
  },
  {
    stem: 'What does "ubiquitous" mean?',
    options: [
      'Extremely rare and valuable',
      'Found everywhere; omnipresent',
      'Difficult to understand',
      'Having multiple meanings',
    ],
    correct_index: 1,
    explanation: 'Ubiquitous means present, appearing, or found everywhere. Example: Smartphones have become ubiquitous in modern life.',
  },
  {
    stem: 'DOCTOR : HOSPITAL :: TEACHER : ?',
    options: ['Student', 'School', 'Book', 'Education'],
    correct_index: 1,
    explanation: 'A doctor works in a hospital. A teacher works in a school. The relationship is professional to their primary workplace.',
  },
]

// ---------- NUMERICAL REASONING (10) ----------
const numericalQuestions: Question[] = [
  {
    stem: 'What is the next number in the sequence? 2, 6, 18, 54, ___',
    options: ['108', '162', '72', '148'],
    correct_index: 1,
    explanation: 'Each number is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.',
  },
  {
    stem: 'A shirt costs Rp 200,000 after a 20% discount. What was the original price?',
    options: ['Rp 220,000', 'Rp 240,000', 'Rp 250,000', 'Rp 260,000'],
    correct_index: 2,
    explanation: 'If 80% of original = Rp 200,000, then original = 200,000 ÷ 0.80 = Rp 250,000.',
  },
  {
    stem: 'If 3 workers can build a wall in 12 hours, how long would it take 6 workers?',
    options: ['24 hours', '6 hours', '8 hours', '4 hours'],
    correct_index: 1,
    explanation: 'Double the workers = half the time. Total work = 3 × 12 = 36 worker-hours. 36 ÷ 6 = 6 hours.',
  },
  {
    stem: 'What is the next number? 1, 1, 2, 3, 5, 8, 13, ___',
    options: ['18', '20', '21', '26'],
    correct_index: 2,
    explanation: 'This is the Fibonacci sequence: each number is the sum of the two before it. 8 + 13 = 21.',
  },
  {
    stem: 'A company\'s revenue grew from Rp 500 million to Rp 650 million. What is the percentage increase?',
    options: ['15%', '23%', '30%', '35%'],
    correct_index: 2,
    explanation: 'Increase = 650 - 500 = 150 million. Percentage = (150 / 500) × 100 = 30%.',
  },
  {
    stem: 'If the ratio of cats to dogs in a shelter is 3:5 and there are 40 animals total, how many cats are there?',
    options: ['12', '15', '24', '25'],
    correct_index: 1,
    explanation: 'Total parts = 3 + 5 = 8. Each part = 40 ÷ 8 = 5. Cats = 3 × 5 = 15.',
  },
  {
    stem: 'What is 15% of 15% of 10,000?',
    options: ['225', '150', '22.5', '1,500'],
    correct_index: 0,
    explanation: '15% of 10,000 = 1,500. 15% of 1,500 = 225.',
  },
  {
    stem: 'A train travels at 80 km/h for 2.5 hours. How far does it go?',
    options: ['160 km', '180 km', '200 km', '220 km'],
    correct_index: 2,
    explanation: 'Distance = Speed × Time = 80 × 2.5 = 200 km.',
  },
  {
    stem: 'What is the missing number? 4, 9, 16, 25, 36, ___',
    options: ['42', '45', '47', '49'],
    correct_index: 3,
    explanation: 'These are perfect squares: 2², 3², 4², 5², 6², and 7² = 49.',
  },
  {
    stem: 'If you invest Rp 10,000,000 at 5% simple interest per year, how much total do you have after 3 years?',
    options: ['Rp 10,500,000', 'Rp 11,500,000', 'Rp 11,576,250', 'Rp 15,000,000'],
    correct_index: 1,
    explanation: 'Simple interest = 10,000,000 × 0.05 × 3 = 1,500,000. Total = 10,000,000 + 1,500,000 = Rp 11,500,000.',
  },
]

// ---------- LOGICAL REASONING (10) ----------
const logicalQuestions: Question[] = [
  {
    stem: 'All roses are flowers. Some flowers fade quickly. Which statement MUST be true?',
    options: [
      'All roses fade quickly.',
      'Some roses fade quickly.',
      'Some flowers are roses.',
      'No roses fade quickly.',
    ],
    correct_index: 2,
    explanation: '"All roses are flowers" means some flowers are roses (the roses). We cannot determine if those particular flowers (roses) fade quickly or not.',
  },
  {
    stem: 'If it rains, the ground gets wet. The ground is wet. What can we conclude?',
    options: [
      'It definitely rained.',
      'It might have rained, or something else made the ground wet.',
      'It did not rain.',
      'It will rain again.',
    ],
    correct_index: 1,
    explanation: 'Rain → wet ground, but wet ground does not guarantee rain (affirming the consequent fallacy). A sprinkler could also wet the ground.',
  },
  {
    stem: 'Look at this pattern: ○ □ △ ○ □ △ ○ □ ___. What comes next?',
    options: ['○', '□', '△', '◇'],
    correct_index: 2,
    explanation: 'The pattern repeats: circle, square, triangle. After square comes triangle (△).',
  },
  {
    stem: 'Anna is taller than Budi. Budi is taller than Citra. Dedi is taller than Anna. Who is the shortest?',
    options: ['Anna', 'Budi', 'Citra', 'Dedi'],
    correct_index: 2,
    explanation: 'Order from tallest: Dedi > Anna > Budi > Citra. Citra is the shortest.',
  },
  {
    stem: 'If all Blips are Blops, and all Blops are Blurps, then:',
    options: [
      'All Blurps are Blips.',
      'Some Blurps are not Blops.',
      'All Blips are Blurps.',
      'No Blips are Blurps.',
    ],
    correct_index: 2,
    explanation: 'By transitivity: Blips ⊂ Blops ⊂ Blurps, so all Blips are Blurps. But not all Blurps are necessarily Blips.',
  },
  {
    stem: 'A man says: "I have two children. One of them is a boy born on a Tuesday." What is the probability that both children are boys?',
    options: ['1/2', '1/3', '13/27', '1/4'],
    correct_index: 2,
    explanation: 'This is a famous probability puzzle. With the "born on Tuesday" constraint, the probability is 13/27 ≈ 48.1%, not the intuitive 1/2 or 1/3.',
  },
  {
    stem: 'In a race, you overtake the person in 2nd place. What position are you now in?',
    options: ['1st place', '2nd place', '3rd place', 'It depends on the race'],
    correct_index: 1,
    explanation: 'If you overtake the person in 2nd, you take their position — you are now 2nd. You did NOT overtake 1st place.',
  },
  {
    stem: 'Which number does NOT belong? 2, 3, 5, 7, 9, 11, 13',
    options: ['2', '9', '11', '3'],
    correct_index: 1,
    explanation: '9 is the only non-prime. 9 = 3 × 3. All others (2, 3, 5, 7, 11, 13) are prime numbers.',
  },
  {
    stem: 'If Monday = 1, Tuesday = 2, ..., Sunday = 7, what day is it 100 days after Monday?',
    options: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
    correct_index: 0,
    explanation: '100 ÷ 7 = 14 remainder 2. So 100 days after Monday (day 1) = day 1 + 2 = day 3 = Wednesday.',
  },
  {
    stem: 'A farmer has 17 sheep. All but 9 die. How many sheep does the farmer have left?',
    options: ['8', '9', '17', '0'],
    correct_index: 1,
    explanation: '"All but 9 die" means 9 survive. The answer is 9, not 17-9=8. The phrasing is intentionally tricky.',
  },
]

// ---------- SPATIAL REASONING (10) ----------
const spatialQuestions: Question[] = [
  {
    stem: 'Imagine the letter "R" reflected in a vertical mirror (left-right flip). Which description matches the result?',
    options: [
      'The letter looks the same as normal R.',
      'The bump and leg of R appear on the LEFT side instead of the right.',
      'The R appears upside down.',
      'The R appears rotated 90° clockwise.',
    ],
    correct_index: 1,
    explanation: 'A vertical mirror flips left-right. The bump and diagonal leg of R (normally on the right) would appear on the left side.',
  },
  {
    stem: 'A cube has 6 faces. If you paint 3 faces that share a single corner, how many faces are left unpainted?',
    options: ['1', '2', '3', '4'],
    correct_index: 2,
    explanation: 'A cube has 6 faces. If 3 share a corner, they are three mutually adjacent faces. 6 - 3 = 3 unpainted faces.',
  },
  {
    stem: 'You are facing North. You turn 90° clockwise, then 180°, then 90° counterclockwise. Which direction are you facing?',
    options: ['North', 'South', 'East', 'West'],
    correct_index: 1,
    explanation: 'North → 90° CW = East → 180° = West → 90° CCW = South.',
  },
  {
    stem: 'If you fold a square piece of paper in half diagonally and cut off the folded corner, what shape do you see when you unfold it?',
    options: ['A square with one corner cut', 'A triangle', 'A diamond-shaped hole in the center', 'A square with two opposite corners cut'],
    correct_index: 2,
    explanation: 'Folding diagonally and cutting the folded corner affects the center of the original square. Unfolding reveals a diamond (rhombus) hole in the middle.',
  },
  {
    stem: 'How many faces does a triangular prism have?',
    options: ['3', '4', '5', '6'],
    correct_index: 2,
    explanation: 'A triangular prism has 5 faces: 2 triangular ends + 3 rectangular sides.',
  },
  {
    stem: 'A clock shows 3:00. What is the angle between the hour and minute hands?',
    options: ['60°', '90°', '120°', '180°'],
    correct_index: 1,
    explanation: 'At 3:00, the minute hand points to 12 and hour hand points to 3. Each hour mark = 30° (360°/12). Three hour marks = 90°.',
  },
  {
    stem: 'Imagine stacking these shapes from bottom to top: a large square, a medium circle on top of it, a small triangle on top of that. Which shape is visible from directly above?',
    options: [
      'Only the triangle',
      'Triangle with circle edges showing around it',
      'Triangle with circle ring and square corners showing',
      'Only the square',
    ],
    correct_index: 2,
    explanation: 'From above, you see the small triangle, the ring of the medium circle extending beyond it, and the four corners of the large square extending beyond the circle.',
  },
  {
    stem: 'If you rotate the letter "N" by 180°, it looks like:',
    options: ['Z', 'N (same)', 'U', 'И'],
    correct_index: 1,
    explanation: 'The letter N has 180° rotational symmetry — rotating it 180° produces the same letter N.',
  },
  {
    stem: 'A standard die has opposite faces summing to 7. If the top face shows 3 and the front face shows 2, what number is on the bottom?',
    options: ['4', '5', '6', '3'],
    correct_index: 0,
    explanation: 'Opposite faces sum to 7. If top = 3, then bottom = 7 - 3 = 4.',
  },
  {
    stem: 'You walk 5 meters East, then 5 meters North, then 5 meters West. How far are you from your starting point?',
    options: ['0 meters', '5 meters', '10 meters', '15 meters'],
    correct_index: 1,
    explanation: '5E + 5N + 5W: The East and West cancel out (net 0 E-W). You are 5 meters North of start.',
  },
]

// ============================================
// Seed Logic
// ============================================

async function seed() {
  console.log('Seeding General Cognitive Ability Test for GIS...\n')

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

  // 2. Get admin user (use limit(1) since org may have multiple owners)
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
  const DECK_TITLE = 'General Cognitive Ability Test'

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
        description: 'A comprehensive cognitive ability assessment measuring verbal, numerical, logical, and spatial reasoning skills. 40 questions across 4 categories.',
        subject: 'Cognitive Ability',
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

  // 4. Insert all 40 card templates
  const allQuestions = [
    ...verbalQuestions,
    ...numericalQuestions,
    ...logicalQuestions,
    ...spatialQuestions,
  ]

  const cardsToInsert = allQuestions.map((q) => ({
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
  console.log(`   Inserted ${allQuestions.length} questions (${verbalQuestions.length}V + ${numericalQuestions.length}N + ${logicalQuestions.length}L + ${spatialQuestions.length}S)`)

  // 5. Create or update assessment
  const ASSESSMENT_TITLE = 'General Cognitive Ability Test'

  const { data: existingAssessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('org_id', org.id)
    .eq('title', ASSESSMENT_TITLE)
    .single()

  if (existingAssessment) {
    // Update existing assessment
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        deck_template_id: deckId,
        description: 'Put your cognitive skills to the test! 40 questions covering verbal reasoning, numerical ability, logical thinking, and spatial awareness. You have 45 minutes. Can you beat the average?',
        time_limit_minutes: 45,
        pass_score: 70,
        question_count: 40,
        shuffle_questions: true,
        shuffle_options: false,
        show_results: true,
        max_attempts: 3,
        allow_review: true,
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
        description: 'Put your cognitive skills to the test! 40 questions covering verbal reasoning, numerical ability, logical thinking, and spatial awareness. You have 45 minutes. Can you beat the average?',
        time_limit_minutes: 45,
        pass_score: 70,
        question_count: 40,
        shuffle_questions: true,
        shuffle_options: false,
        show_results: true,
        max_attempts: 3,
        allow_review: true,
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

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('IQ Test Seed Complete!')
  console.log('')
  console.log('Deck:       General Cognitive Ability Test')
  console.log('Questions:  40 (10 verbal + 10 numerical + 10 logical + 10 spatial)')
  console.log('Assessment: Published, 45 min, 70% pass, 3 attempts')
  console.log('Org:        GIS (gis)')
  console.log('')
  console.log('Login:      admin@gis.cekatan.com / password123')
  console.log('='.repeat(50))
}

seed().catch(console.error)

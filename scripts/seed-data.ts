/**
 * Database Seed Script for GamaTest
 *
 * Seeds two tenant organizations (GIS & GLS) with sample deck templates.
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

// ============================================
// Tenant Configuration
// ============================================

interface TenantConfig {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  decks: DeckConfig[];
}

interface DeckConfig {
  title: string;
  subject: string;
  description: string;
  cards: { front: string; back: string }[];
}

const TENANTS: TenantConfig[] = [
  {
    name: 'PT. Gama Intisamudera',
    slug: 'gis',
    ownerEmail: 'admin@gis.gamatest.com',
    ownerPassword: 'password123',
    decks: [
      {
        title: 'Heavy Equipment Safety',
        subject: 'Safety',
        description: 'Safety protocols and procedures for heavy equipment operations',
        cards: [
          {
            front: 'What are the 5 essential PPE items required before operating heavy equipment?',
            back: `1. Hard hat (ANSI Z89.1 compliant)
2. Safety glasses or goggles
3. Steel-toed boots
4. High-visibility vest
5. Hearing protection (earplugs or earmuffs)

Additional PPE may be required based on specific equipment and site conditions.`
          },
          {
            front: 'What is the "Three Points of Contact" rule when mounting/dismounting equipment?',
            back: `Always maintain three points of contact with the machine:
- Two hands and one foot, OR
- Two feet and one hand

Rules:
- Face the machine when climbing
- Never jump off equipment
- Use handrails and steps provided
- Keep boots free of mud/grease to prevent slipping`
          },
          {
            front: 'What are the pre-operation inspection steps for a forklift (daily checklist)?',
            back: `PRE-OPERATION CHECKLIST:
1. Walk-around visual inspection (leaks, damage, tires)
2. Check fluid levels (oil, hydraulic, coolant)
3. Test horn, lights, and backup alarm
4. Inspect forks for cracks or bends
5. Check mast chains and hydraulic hoses
6. Test brakes (service and parking)
7. Verify seat belt functionality
8. Check load backrest extension

Report any defects before operating.`
          },
        ]
      },
      {
        title: 'Logistics Operations Basics',
        subject: 'Operations',
        description: 'Fundamentals of warehouse and logistics operations',
        cards: [
          {
            front: 'What is FIFO and why is it important in warehouse management?',
            back: `FIFO = First In, First Out

Principle: Items received first should be shipped/used first.

Importance:
- Prevents product expiration/obsolescence
- Ensures accurate inventory rotation
- Reduces waste and spoilage
- Required for perishable goods
- Maintains product quality standards

Implementation: Use date-coded labels and organize storage lanes to facilitate FIFO flow.`
          },
          {
            front: 'What are the key differences between cross-docking and traditional warehousing?',
            back: `CROSS-DOCKING:
- Products move directly from inbound to outbound
- Minimal or no storage time (< 24 hours)
- Reduces handling and storage costs
- Requires precise coordination and timing

TRADITIONAL WAREHOUSING:
- Products are stored for extended periods
- Inventory is picked, packed, and shipped as needed
- Higher storage costs but more flexibility
- Better for unpredictable demand patterns

Use cross-docking for high-volume, predictable, time-sensitive goods.`
          },
          {
            front: 'What are the 5S principles in warehouse organization?',
            back: `5S METHODOLOGY:
1. Sort (Seiri) - Remove unnecessary items
2. Set in Order (Seiton) - Organize remaining items logically
3. Shine (Seiso) - Clean the workspace thoroughly
4. Standardize (Seiketsu) - Create consistent procedures
5. Sustain (Shitsuke) - Maintain and continuously improve

Benefits: Improved safety, efficiency, quality, and morale.`
          },
        ]
      },
      {
        title: 'Customer Service Skills',
        subject: 'General',
        description: 'Essential customer service and communication skills',
        cards: [
          {
            front: 'What are the 5 key steps in handling a customer complaint?',
            back: `1. LISTEN actively without interrupting
2. ACKNOWLEDGE the customer\'s feelings and apologize
3. INVESTIGATE the issue to understand root cause
4. RESOLVE with a clear solution or next steps
5. FOLLOW UP to ensure satisfaction

Key principle: The customer wants to feel heard before they want a solution.`
          },
          {
            front: 'What is the difference between empathy and sympathy in customer service?',
            back: `EMPATHY: Understanding and sharing the customer's feelings
- "I understand how frustrating this must be for you"
- Shows you relate to their experience
- Builds trust and connection

SYMPATHY: Feeling pity or sorrow for the customer
- "I'm sorry that happened to you"
- Can feel distant or condescending
- Less effective at building rapport

Best practice: Use empathy statements to validate, then move to problem-solving.`
          },
        ]
      },
    ]
  },
  {
    name: 'PT. Gama Lintas Samudera',
    slug: 'gls',
    ownerEmail: 'admin@gls.gamatest.com',
    ownerPassword: 'password123',
    decks: [
      {
        title: 'Freight Forwarding Fundamentals',
        subject: 'Logistics',
        description: 'Core concepts in international freight forwarding',
        cards: [
          {
            front: 'What are the key differences between FCL and LCL shipping?',
            back: `FCL (Full Container Load):
- Entire container used by one shipper
- Sealed at origin, opened at destination
- Lower per-unit cost for large volumes
- Faster transit (no consolidation needed)

LCL (Less than Container Load):
- Container shared among multiple shippers
- Cargo consolidated at CFS (Container Freight Station)
- Higher per-unit cost but economical for small shipments
- Longer transit due to consolidation/deconsolidation

Decision factor: Generally, if cargo fills >60% of a container, FCL is more cost-effective.`
          },
          {
            front: 'What are Incoterms and what do FOB and CIF mean?',
            back: `INCOTERMS: International Commercial Terms (ICC rules defining buyer/seller responsibilities)

FOB (Free On Board):
- Seller delivers goods on board the vessel
- Risk transfers when goods pass ship's rail
- Buyer arranges and pays for ocean freight & insurance
- Common in US trade

CIF (Cost, Insurance & Freight):
- Seller arranges and pays for freight + minimum insurance
- Risk transfers when goods are on board at origin port
- Buyer responsible from destination port onwards
- Common in international trade

Key difference: CIF includes freight and insurance in the seller's price; FOB does not.`
          },
          {
            front: 'What documents are required for international sea freight shipment?',
            back: `ESSENTIAL DOCUMENTS:
1. Bill of Lading (B/L) - Title document for cargo
2. Commercial Invoice - Value declaration for customs
3. Packing List - Detailed contents description
4. Certificate of Origin (COO) - Country of manufacture
5. Customs Declaration - Import/export filing

ADDITIONAL (as required):
- Letter of Credit (L/C) - Payment guarantee
- Insurance Certificate - Cargo coverage proof
- Phytosanitary Certificate - For agricultural goods
- Dangerous Goods Declaration - For hazmat cargo
- Fumigation Certificate - Wooden packaging compliance`
          },
        ]
      },
      {
        title: 'Sales Aptitude Assessment',
        subject: 'Sales',
        description: 'Key concepts and techniques for sales professionals',
        cards: [
          {
            front: 'What is the SPIN selling technique?',
            back: `SPIN = Situation, Problem, Implication, Need-Payoff

1. SITUATION Questions: Gather facts about buyer's current state
   "How many shipments do you handle monthly?"

2. PROBLEM Questions: Identify pain points
   "What challenges do you face with transit times?"

3. IMPLICATION Questions: Explore consequences of problems
   "How do delays affect your customer relationships?"

4. NEED-PAYOFF Questions: Guide buyer to see value of solution
   "Would reducing transit time by 3 days help retain clients?"

Key: Move from understanding to making the buyer articulate the value.`
          },
          {
            front: 'What are the stages of a typical B2B sales pipeline?',
            back: `B2B SALES PIPELINE STAGES:
1. Prospecting - Identify potential customers
2. Qualification - Assess fit (BANT: Budget, Authority, Need, Timeline)
3. Discovery/Needs Analysis - Deep-dive into requirements
4. Proposal/Presentation - Present tailored solution
5. Negotiation - Discuss terms, pricing, conditions
6. Closing - Finalize agreement and contract
7. Onboarding - Deliver and ensure smooth start

Key metrics: Conversion rate between stages, average deal size, sales cycle length.`
          },
        ]
      },
      {
        title: 'International Trade Compliance',
        subject: 'Compliance',
        description: 'Regulatory compliance for international trade operations',
        cards: [
          {
            front: 'What is the HS Code system and why is it important?',
            back: `HS CODE (Harmonized System):
- International standardized system of names and numbers
- Classifies traded products (maintained by WCO)
- 6-digit base code used globally
- Countries add digits for national specificity (e.g., 10-digit in US)

IMPORTANCE:
- Determines applicable tariff/duty rates
- Controls import/export restrictions
- Required for customs declarations worldwide
- Enables trade statistics and analysis
- Incorrect classification can result in penalties, delays, or seizure

Example: 8471.30 = Portable digital automatic data processing machines (laptops)`
          },
          {
            front: 'What are the key elements of a customs compliance program?',
            back: `CUSTOMS COMPLIANCE PROGRAM ELEMENTS:
1. Classification - Correct HS/tariff codes for all products
2. Valuation - Accurate declaration of goods value (transaction value method)
3. Country of Origin - Proper origin determination and marking
4. Record Keeping - Maintain import/export records (typically 5 years)
5. Licensing - Obtain required permits and licenses
6. Denied Party Screening - Check against restricted entity lists
7. Internal Audits - Regular self-assessment of compliance
8. Training - Staff education on regulations and procedures

Non-compliance risks: Fines, penalties, shipment seizure, loss of import privileges.`
          },
          {
            front: 'What is an AEO (Authorized Economic Operator) and what are its benefits?',
            back: `AEO = Authorized Economic Operator

A customs certification program recognizing trusted traders who meet security and compliance standards.

BENEFITS:
- Fewer physical inspections of cargo
- Priority processing at customs
- Reduced documentation requirements
- Mutual recognition with partner countries
- Lower risk scores in customs systems
- Faster clearance times

REQUIREMENTS:
- Proven compliance track record
- Satisfactory record-keeping system
- Financial solvency
- Security and safety standards compliance
- Staff training and awareness programs

Based on WCO SAFE Framework; implemented differently per country.`
          },
        ]
      },
    ]
  },
];

// ============================================
// Seed Functions
// ============================================

async function getOrCreateUser(email: string, password: string): Promise<string> {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u: { email?: string }) => u.email === email
  );

  if (existing) {
    console.log(`   User ${email} already exists`);
    return existing.id;
  }

  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error(`Failed to create user ${email}:`, error.message);
    process.exit(1);
  }

  console.log(`   Created user ${email}`);
  return newUser.user.id;
}

async function getOrCreateOrg(name: string, slug: string): Promise<string> {
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    console.log(`   Org "${name}" (${slug}) already exists`);
    return existing.id;
  }

  const settings = {
    features: {
      study_mode: true,
      assessment_mode: true,
      proctoring: false,
      ai_tagging: true,
      bulk_import: true,
      analytics: true,
      erp_integration: false,
    },
    branding: {
      primary_color: '#1e40af',
      logo_url: '',
    },
    default_language: 'id',
  };

  const { data: newOrg, error } = await supabase
    .from('organizations')
    .insert({ name, slug, settings })
    .select('id')
    .single();

  if (error) {
    console.error(`Failed to create org ${name}:`, error.message);
    process.exit(1);
  }

  console.log(`   Created org "${name}" (${slug})`);
  return newOrg.id;
}

async function ensureOrgMember(orgId: string, userId: string, role: string) {
  const { data: existing } = await supabase
    .from('organization_members')
    .select('id')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (existing) return;

  const { error } = await supabase
    .from('organization_members')
    .insert({ org_id: orgId, user_id: userId, role });

  if (error) {
    console.error(`Failed to add member to org:`, error.message);
    process.exit(1);
  }
}

async function seedDecks(orgId: string, userId: string, decks: DeckConfig[]) {
  for (const deck of decks) {
    // Check for existing deck
    const { data: existing } = await supabase
      .from('deck_templates')
      .select('id')
      .eq('org_id', orgId)
      .eq('title', deck.title)
      .single();

    let deckId: string;

    if (existing) {
      console.log(`      Deck "${deck.title}" already exists, refreshing cards...`);
      deckId = existing.id;
      await supabase.from('card_templates').delete().eq('deck_template_id', deckId);
    } else {
      const { data: newDeck, error } = await supabase
        .from('deck_templates')
        .insert({
          title: deck.title,
          description: deck.description,
          subject: deck.subject,
          visibility: 'private',
          author_id: userId,
          org_id: orgId,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Failed to create deck "${deck.title}":`, error.message);
        continue;
      }
      deckId = newDeck.id;
    }

    // Insert card templates
    const cardsToInsert = deck.cards.map((card, i) => ({
      deck_template_id: deckId,
      card_type: 'flashcard' as const,
      front: card.front,
      back: card.back,
      sort_order: i,
    }));

    const { error: cardsError } = await supabase
      .from('card_templates')
      .insert(cardsToInsert);

    if (cardsError) {
      console.error(`Failed to insert cards for "${deck.title}":`, cardsError.message);
      continue;
    }

    console.log(`      "${deck.title}" - ${deck.cards.length} cards`);
  }
}

// ============================================
// Main Seed
// ============================================

async function seed() {
  console.log('Starting GamaTest multi-tenant seed...\n');

  for (const tenant of TENANTS) {
    console.log(`\n== ${tenant.name} (${tenant.slug}) ==`);

    // 1. Create user
    const userId = await getOrCreateUser(tenant.ownerEmail, tenant.ownerPassword);

    // 2. Ensure profile exists
    const { data: profileExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!profileExists) {
      await supabase.from('profiles').insert({
        id: userId,
        email: tenant.ownerEmail,
        full_name: `Admin ${tenant.slug.toUpperCase()}`,
      });
    }

    // 3. Create org
    const orgId = await getOrCreateOrg(tenant.name, tenant.slug);

    // 4. Add user as owner
    await ensureOrgMember(orgId, userId, 'owner');

    // 5. Seed decks
    console.log(`   Seeding ${tenant.decks.length} decks:`);
    await seedDecks(orgId, userId, tenant.decks);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Seed completed successfully!\n');
  for (const tenant of TENANTS) {
    console.log(`${tenant.name} (${tenant.slug}):`);
    console.log(`   Email:    ${tenant.ownerEmail}`);
    console.log(`   Password: ${tenant.ownerPassword}`);
    console.log(`   Decks:    ${tenant.decks.map(d => d.title).join(', ')}`);
    console.log('');
  }
  console.log('='.repeat(50));
}

seed().catch(console.error);

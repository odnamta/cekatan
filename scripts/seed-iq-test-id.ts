/**
 * Seed Script: Tes Kemampuan Kognitif Umum (Bahasa Indonesia)
 *
 * Seeds a 40-question IQ/cognitive ability test in Indonesian under the GIS org.
 * Creates deck_template + card_templates + published assessment.
 *
 * Usage: npm run seed:iq-id
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
// Soal — 40 Pilihan Ganda dalam 4 kategori
// ============================================

interface Question {
  stem: string
  options: string[]
  correct_index: number
  explanation: string
}

// ---------- PENALARAN VERBAL (10) ----------
const verbalQuestions: Question[] = [
  {
    stem: 'Lengkapi peribahasa berikut: "Air beriak tanda ___"',
    options: ['dalam', 'tak dalam', 'dangkal', 'tenang'],
    correct_index: 1,
    explanation: 'Peribahasa lengkapnya adalah "Air beriak tanda tak dalam." Artinya orang yang banyak bicara atau sombong biasanya tidak berilmu.',
  },
  {
    stem: 'Manakah yang merupakan SINONIM dari kata "MUFAKAT"?',
    options: ['Perselisihan', 'Kesepakatan', 'Kecurigaan', 'Keraguan'],
    correct_index: 1,
    explanation: 'Mufakat berarti kesepakatan atau persetujuan bersama. Kata ini sering digunakan dalam frasa "musyawarah untuk mufakat."',
  },
  {
    stem: 'GURU : SEKOLAH :: DOKTER : ?',
    options: ['Pasien', 'Rumah Sakit', 'Obat', 'Kesehatan'],
    correct_index: 1,
    explanation: 'Guru bekerja di sekolah. Dokter bekerja di rumah sakit. Hubungannya adalah profesi dengan tempat kerjanya.',
  },
  {
    stem: 'Manakah yang merupakan ANTONIM dari kata "LANCANG"?',
    options: ['Berani', 'Sopan', 'Kasar', 'Cepat'],
    correct_index: 1,
    explanation: 'Lancang berarti tidak sopan atau kurang ajar. Antonimnya adalah sopan, yaitu berperilaku dengan tata krama yang baik.',
  },
  {
    stem: 'Lengkapi peribahasa berikut: "Seperti pungguk merindukan ___"',
    options: ['matahari', 'bulan', 'bintang', 'hujan'],
    correct_index: 1,
    explanation: 'Peribahasa lengkapnya adalah "Seperti pungguk merindukan bulan." Artinya mengharapkan sesuatu yang tidak mungkin tercapai.',
  },
  {
    stem: 'BUKU : RAK :: BAJU : ?',
    options: ['Gantungan', 'Lemari', 'Cucian', 'Kain'],
    correct_index: 1,
    explanation: 'Buku disimpan di rak. Baju disimpan di lemari. Keduanya menunjukkan hubungan benda dengan tempat penyimpanannya.',
  },
  {
    stem: '"Meskipun sikapnya _____, hatinya sebenarnya sangat lembut." Pilih kata yang paling tepat:',
    options: ['Ramah', 'Dingin', 'Hangat', 'Ceria'],
    correct_index: 1,
    explanation: 'Kata "meskipun" menunjukkan pertentangan. Jika hatinya lembut, maka sikapnya pastilah kebalikannya, yaitu dingin.',
  },
  {
    stem: 'Apa arti kata "PARADOKS"?',
    options: [
      'Pernyataan yang sangat jelas kebenarannya',
      'Pernyataan yang tampak bertentangan tetapi mengandung kebenaran',
      'Pernyataan yang sepenuhnya salah',
      'Pernyataan yang tidak dapat dibuktikan',
    ],
    correct_index: 1,
    explanation: 'Paradoks adalah pernyataan yang seolah-olah bertentangan atau mustahil, tetapi sebenarnya mengandung kebenaran. Contoh: "Semakin tahu, semakin sadar betapa tidak tahunya kita."',
  },
  {
    stem: 'SIMFONI : KOMPONIS :: NOVEL : ?',
    options: ['Pembaca', 'Penerbit', 'Pengarang', 'Perpustakaan'],
    correct_index: 2,
    explanation: 'Komponis menciptakan simfoni. Pengarang menciptakan novel. Hubungannya adalah pencipta dengan karyanya.',
  },
  {
    stem: 'Pasangan kata manakah yang memiliki hubungan sama seperti API : ABU?',
    options: ['Hujan : Awan', 'Makan : Lapar', 'Ledakan : Puing', 'Tanaman : Biji'],
    correct_index: 2,
    explanation: 'Api menghasilkan abu sebagai sisa/residu. Ledakan menghasilkan puing sebagai sisa/residu. Keduanya menunjukkan hubungan sebab → sisa hasil.',
  },
]

// ---------- PENALARAN NUMERIK (10) ----------
const numericalQuestions: Question[] = [
  {
    stem: 'Berapakah bilangan selanjutnya dalam deret ini? 2, 6, 18, 54, ___',
    options: ['108', '162', '72', '148'],
    correct_index: 1,
    explanation: 'Setiap bilangan dikalikan 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.',
  },
  {
    stem: 'Sebuah baju dijual Rp 200.000 setelah diskon 20%. Berapa harga aslinya?',
    options: ['Rp 220.000', 'Rp 240.000', 'Rp 250.000', 'Rp 260.000'],
    correct_index: 2,
    explanation: 'Jika 80% dari harga asli = Rp 200.000, maka harga asli = 200.000 ÷ 0,80 = Rp 250.000.',
  },
  {
    stem: 'Jika 3 pekerja dapat membangun tembok dalam 12 jam, berapa lama waktu yang dibutuhkan 6 pekerja?',
    options: ['24 jam', '6 jam', '8 jam', '4 jam'],
    correct_index: 1,
    explanation: 'Dua kali lipat pekerja = setengah waktu. Total kerja = 3 × 12 = 36 jam-orang. 36 ÷ 6 = 6 jam.',
  },
  {
    stem: 'Berapakah bilangan selanjutnya? 1, 1, 2, 3, 5, 8, 13, ___',
    options: ['18', '20', '21', '26'],
    correct_index: 2,
    explanation: 'Ini adalah deret Fibonacci: setiap bilangan merupakan penjumlahan dua bilangan sebelumnya. 8 + 13 = 21.',
  },
  {
    stem: 'Pendapatan perusahaan naik dari Rp 500 juta menjadi Rp 650 juta. Berapa persen kenaikannya?',
    options: ['15%', '23%', '30%', '35%'],
    correct_index: 2,
    explanation: 'Kenaikan = 650 - 500 = 150 juta. Persentase = (150 / 500) × 100 = 30%.',
  },
  {
    stem: 'Perbandingan kucing dan anjing di sebuah penampungan adalah 3:5 dan total ada 40 hewan. Berapa jumlah kucing?',
    options: ['12', '15', '24', '25'],
    correct_index: 1,
    explanation: 'Total bagian = 3 + 5 = 8. Tiap bagian = 40 ÷ 8 = 5. Kucing = 3 × 5 = 15.',
  },
  {
    stem: 'Berapa 15% dari 15% dari 10.000?',
    options: ['225', '150', '22,5', '1.500'],
    correct_index: 0,
    explanation: '15% dari 10.000 = 1.500. 15% dari 1.500 = 225.',
  },
  {
    stem: 'Sebuah kereta melaju dengan kecepatan 80 km/jam selama 2,5 jam. Berapa jarak yang ditempuh?',
    options: ['160 km', '180 km', '200 km', '220 km'],
    correct_index: 2,
    explanation: 'Jarak = Kecepatan × Waktu = 80 × 2,5 = 200 km.',
  },
  {
    stem: 'Berapakah bilangan yang hilang? 4, 9, 16, 25, 36, ___',
    options: ['42', '45', '47', '49'],
    correct_index: 3,
    explanation: 'Ini adalah bilangan kuadrat sempurna: 2², 3², 4², 5², 6², dan 7² = 49.',
  },
  {
    stem: 'Jika Anda menginvestasikan Rp 10.000.000 dengan bunga sederhana 5% per tahun, berapa total uang Anda setelah 3 tahun?',
    options: ['Rp 10.500.000', 'Rp 11.500.000', 'Rp 11.576.250', 'Rp 15.000.000'],
    correct_index: 1,
    explanation: 'Bunga sederhana = 10.000.000 × 0,05 × 3 = 1.500.000. Total = 10.000.000 + 1.500.000 = Rp 11.500.000.',
  },
]

// ---------- PENALARAN LOGIS (10) ----------
const logicalQuestions: Question[] = [
  {
    stem: 'Semua mawar adalah bunga. Sebagian bunga cepat layu. Pernyataan mana yang PASTI benar?',
    options: [
      'Semua mawar cepat layu.',
      'Sebagian mawar cepat layu.',
      'Sebagian bunga adalah mawar.',
      'Tidak ada mawar yang cepat layu.',
    ],
    correct_index: 2,
    explanation: '"Semua mawar adalah bunga" berarti sebagian bunga pasti mawar. Kita tidak bisa menentukan apakah mawar termasuk yang cepat layu atau tidak.',
  },
  {
    stem: 'Jika hujan turun, tanah menjadi basah. Tanah basah. Apa yang bisa kita simpulkan?',
    options: [
      'Pasti sudah hujan.',
      'Mungkin hujan, atau ada hal lain yang membuat tanah basah.',
      'Tidak hujan.',
      'Akan hujan lagi.',
    ],
    correct_index: 1,
    explanation: 'Hujan → tanah basah, tetapi tanah basah belum tentu karena hujan (kekeliruan afirmasi konsekuen). Bisa saja karena air siram.',
  },
  {
    stem: 'Perhatikan pola berikut: ○ □ △ ○ □ △ ○ □ ___. Apa yang selanjutnya?',
    options: ['○', '□', '△', '◇'],
    correct_index: 2,
    explanation: 'Polanya berulang: lingkaran, persegi, segitiga. Setelah persegi adalah segitiga (△).',
  },
  {
    stem: 'Ani lebih tinggi dari Budi. Budi lebih tinggi dari Citra. Dedi lebih tinggi dari Ani. Siapa yang paling pendek?',
    options: ['Ani', 'Budi', 'Citra', 'Dedi'],
    correct_index: 2,
    explanation: 'Urutan dari tertinggi: Dedi > Ani > Budi > Citra. Citra yang paling pendek.',
  },
  {
    stem: 'Jika semua Blip adalah Blop, dan semua Blop adalah Blurp, maka:',
    options: [
      'Semua Blurp adalah Blip.',
      'Sebagian Blurp bukan Blop.',
      'Semua Blip adalah Blurp.',
      'Tidak ada Blip yang merupakan Blurp.',
    ],
    correct_index: 2,
    explanation: 'Secara transitif: Blip ⊂ Blop ⊂ Blurp, jadi semua Blip adalah Blurp. Tetapi tidak semua Blurp harus Blip.',
  },
  {
    stem: 'Seorang pria berkata: "Saya punya dua anak. Salah satunya laki-laki yang lahir pada hari Selasa." Berapa probabilitas kedua anaknya laki-laki?',
    options: ['1/2', '1/3', '13/27', '1/4'],
    correct_index: 2,
    explanation: 'Ini adalah teka-teki probabilitas terkenal. Dengan batasan "lahir hari Selasa", probabilitasnya adalah 13/27 ≈ 48,1%, bukan 1/2 atau 1/3 yang intuitif.',
  },
  {
    stem: 'Dalam sebuah perlombaan lari, Anda menyalip orang di posisi ke-2. Anda sekarang di posisi berapa?',
    options: ['Posisi 1', 'Posisi 2', 'Posisi 3', 'Tergantung jumlah peserta'],
    correct_index: 1,
    explanation: 'Jika Anda menyalip orang di posisi ke-2, Anda mengambil posisinya — Anda sekarang di posisi ke-2. Anda BELUM menyalip yang pertama.',
  },
  {
    stem: 'Bilangan mana yang TIDAK termasuk kelompok? 2, 3, 5, 7, 9, 11, 13',
    options: ['2', '9', '11', '3'],
    correct_index: 1,
    explanation: '9 adalah satu-satunya bilangan bukan prima. 9 = 3 × 3. Semua bilangan lain (2, 3, 5, 7, 11, 13) adalah bilangan prima.',
  },
  {
    stem: 'Jika Senin = 1, Selasa = 2, ..., Minggu = 7, hari apa 100 hari setelah Senin?',
    options: ['Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    correct_index: 0,
    explanation: '100 ÷ 7 = 14 sisa 2. Jadi 100 hari setelah Senin (hari ke-1) = hari ke-1 + 2 = hari ke-3 = Rabu.',
  },
  {
    stem: 'Seorang petani punya 17 ekor domba. Semua mati kecuali 9. Berapa domba yang tersisa?',
    options: ['8', '9', '17', '0'],
    correct_index: 1,
    explanation: '"Semua mati kecuali 9" berarti 9 ekor selamat. Jawabannya 9, bukan 17-9=8. Kalimatnya sengaja dibuat menjebak.',
  },
]

// ---------- PENALARAN SPASIAL (10) ----------
const spatialQuestions: Question[] = [
  {
    stem: 'Bayangkan huruf "R" dicerminkan secara vertikal (dibalik kiri-kanan). Deskripsi mana yang sesuai dengan hasilnya?',
    options: [
      'Hurufnya terlihat sama seperti R biasa.',
      'Tonjolan dan kaki R muncul di sisi KIRI, bukan kanan.',
      'R terlihat terbalik atas-bawah.',
      'R terlihat diputar 90° searah jarum jam.',
    ],
    correct_index: 1,
    explanation: 'Cermin vertikal membalik kiri-kanan. Tonjolan dan kaki diagonal R (biasanya di kanan) akan muncul di sisi kiri.',
  },
  {
    stem: 'Sebuah kubus memiliki 6 sisi. Jika Anda mengecat 3 sisi yang bertemu di satu sudut, berapa sisi yang tidak dicat?',
    options: ['1', '2', '3', '4'],
    correct_index: 2,
    explanation: 'Kubus punya 6 sisi. Jika 3 sisi bertemu di satu sudut, ketiganya saling bersebelahan. 6 - 3 = 3 sisi tidak dicat.',
  },
  {
    stem: 'Anda menghadap Utara. Anda berputar 90° searah jarum jam, lalu 180°, lalu 90° berlawanan arah jarum jam. Ke arah mana Anda menghadap?',
    options: ['Utara', 'Selatan', 'Timur', 'Barat'],
    correct_index: 1,
    explanation: 'Utara → 90° searah = Timur → 180° = Barat → 90° berlawanan = Selatan.',
  },
  {
    stem: 'Jika Anda melipat kertas persegi secara diagonal lalu memotong sudut yang terlipat, bentuk apa yang terlihat saat dibuka?',
    options: ['Persegi dengan satu sudut terpotong', 'Segitiga', 'Lubang berbentuk belah ketupat di tengah', 'Persegi dengan dua sudut berlawanan terpotong'],
    correct_index: 2,
    explanation: 'Melipat secara diagonal dan memotong sudut lipatan mempengaruhi bagian tengah persegi asli. Saat dibuka, terlihat lubang belah ketupat di tengah.',
  },
  {
    stem: 'Berapa jumlah sisi (bidang) pada prisma segitiga?',
    options: ['3', '4', '5', '6'],
    correct_index: 2,
    explanation: 'Prisma segitiga memiliki 5 sisi: 2 alas segitiga + 3 sisi persegi panjang.',
  },
  {
    stem: 'Sebuah jam menunjukkan pukul 3:00. Berapa besar sudut antara jarum jam dan jarum menit?',
    options: ['60°', '90°', '120°', '180°'],
    correct_index: 1,
    explanation: 'Pada pukul 3:00, jarum menit menunjuk ke 12 dan jarum jam menunjuk ke 3. Setiap angka jam = 30° (360°/12). Tiga angka jam = 90°.',
  },
  {
    stem: 'Bayangkan Anda menumpuk bentuk dari bawah ke atas: persegi besar, lingkaran sedang di atasnya, segitiga kecil di paling atas. Bentuk apa yang terlihat dari atas?',
    options: [
      'Hanya segitiga',
      'Segitiga dengan tepi lingkaran terlihat di sekitarnya',
      'Segitiga, cincin lingkaran, dan sudut persegi terlihat semua',
      'Hanya persegi',
    ],
    correct_index: 2,
    explanation: 'Dari atas, Anda melihat segitiga kecil, cincin lingkaran sedang yang melampaui segitiga, dan empat sudut persegi besar yang melampaui lingkaran.',
  },
  {
    stem: 'Jika huruf "N" diputar 180°, hasilnya terlihat seperti:',
    options: ['Z', 'N (sama)', 'U', 'И'],
    correct_index: 1,
    explanation: 'Huruf N memiliki simetri rotasi 180° — memutarnya 180° menghasilkan huruf N yang sama.',
  },
  {
    stem: 'Dadu standar memiliki jumlah sisi berlawanan = 7. Jika sisi atas menunjukkan 3 dan sisi depan menunjukkan 2, berapa angka di sisi bawah?',
    options: ['4', '5', '6', '3'],
    correct_index: 0,
    explanation: 'Sisi berlawanan berjumlah 7. Jika atas = 3, maka bawah = 7 - 3 = 4.',
  },
  {
    stem: 'Anda berjalan 5 meter ke Timur, lalu 5 meter ke Utara, lalu 5 meter ke Barat. Berapa jarak Anda dari titik awal?',
    options: ['0 meter', '5 meter', '10 meter', '15 meter'],
    correct_index: 1,
    explanation: '5 Timur + 5 Utara + 5 Barat: Timur dan Barat saling menghapus (net 0 Timur-Barat). Anda berada 5 meter di Utara dari titik awal.',
  },
]

// ============================================
// Logika Seed
// ============================================

async function seed() {
  console.log('Seeding Tes Kemampuan Kognitif Umum (Bahasa Indonesia) untuk GIS...\n')

  // 1. Ambil organisasi GIS
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'gis')
    .single()

  if (orgError || !org) {
    console.error('Organisasi GIS tidak ditemukan. Jalankan `npm run seed` terlebih dahulu.')
    process.exit(1)
  }
  console.log(`   Ditemukan org GIS: ${org.id}`)

  // 2. Ambil user admin (gunakan limit(1) karena org mungkin punya beberapa owner)
  const { data: adminMembers } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('org_id', org.id)
    .eq('role', 'owner')
    .limit(1)

  if (!adminMembers || adminMembers.length === 0) {
    console.error('Tidak ditemukan owner untuk organisasi GIS.')
    process.exit(1)
  }
  const userId = adminMembers[0].user_id
  console.log(`   Ditemukan admin user: ${userId}`)

  // 3. Buat atau perbarui deck template
  const DECK_TITLE = 'Tes Kemampuan Kognitif Umum (Bahasa Indonesia)'

  const { data: existingDeck } = await supabase
    .from('deck_templates')
    .select('id')
    .eq('org_id', org.id)
    .eq('title', DECK_TITLE)
    .single()

  let deckId: string

  if (existingDeck) {
    console.log(`   Deck "${DECK_TITLE}" sudah ada, memperbarui kartu...`)
    deckId = existingDeck.id
    await supabase.from('card_templates').delete().eq('deck_template_id', deckId)
  } else {
    const { data: newDeck, error } = await supabase
      .from('deck_templates')
      .insert({
        title: DECK_TITLE,
        description: 'Tes kemampuan kognitif komprehensif yang mengukur keterampilan penalaran verbal, numerik, logis, dan spasial. 40 soal dalam 4 kategori.',
        subject: 'Kemampuan Kognitif',
        visibility: 'private',
        author_id: userId,
        org_id: org.id,
      })
      .select('id')
      .single()

    if (error || !newDeck) {
      console.error('Gagal membuat deck:', error?.message)
      process.exit(1)
    }
    deckId = newDeck.id
    console.log(`   Deck dibuat: ${deckId}`)
  }

  // 4. Masukkan semua 40 kartu soal
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
    console.error('Gagal memasukkan kartu:', cardsError.message)
    process.exit(1)
  }
  console.log(`   Berhasil memasukkan ${allQuestions.length} soal (${verbalQuestions.length} Verbal + ${numericalQuestions.length} Numerik + ${logicalQuestions.length} Logis + ${spatialQuestions.length} Spasial)`)

  // 5. Buat atau perbarui assessment
  const ASSESSMENT_TITLE = 'Tes Kemampuan Kognitif Umum'

  const { data: existingAssessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('org_id', org.id)
    .eq('title', ASSESSMENT_TITLE)
    .single()

  if (existingAssessment) {
    // Perbarui assessment yang sudah ada
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        deck_template_id: deckId,
        description: 'Uji kemampuan kognitif Anda! 40 soal mencakup penalaran verbal, kemampuan numerik, berpikir logis, dan kesadaran spasial. Waktu pengerjaan 45 menit. Bisakah Anda melampaui rata-rata?',
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
      console.error('Gagal memperbarui assessment:', updateError.message)
      process.exit(1)
    }
    console.log(`   Assessment diperbarui: ${existingAssessment.id}`)
  } else {
    const { data: newAssessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        org_id: org.id,
        deck_template_id: deckId,
        title: ASSESSMENT_TITLE,
        description: 'Uji kemampuan kognitif Anda! 40 soal mencakup penalaran verbal, kemampuan numerik, berpikir logis, dan kesadaran spasial. Waktu pengerjaan 45 menit. Bisakah Anda melampaui rata-rata?',
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
      console.error('Gagal membuat assessment:', assessmentError?.message)
      process.exit(1)
    }
    console.log(`   Assessment dibuat: ${newAssessment.id}`)
  }

  // Ringkasan
  console.log('\n' + '='.repeat(50))
  console.log('Seed Tes IQ (Bahasa Indonesia) Selesai!')
  console.log('')
  console.log('Deck:       Tes Kemampuan Kognitif Umum (Bahasa Indonesia)')
  console.log('Soal:       40 (10 verbal + 10 numerik + 10 logis + 10 spasial)')
  console.log('Assessment: Published, 45 menit, 70% lulus, 3 percobaan')
  console.log('Org:        GIS (gis)')
  console.log('')
  console.log('Login:      admin@gis.cekatan.com / password123')
  console.log('='.repeat(50))
}

seed().catch(console.error)

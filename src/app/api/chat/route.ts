import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.CHAT_MODEL || 'qwen/qwen3.6-plus:free';

const SYSTEM_PROMPT = `Kamu adalah SI SAKTI (Sarana Advokasi Kajian Strategis dan Teknologi Informatika), maskot robot advokasi dari HIMATIF (Himpunan Mahasiswa Teknik Informatika) Universitas Islam Negeri Sunan Gunung Djati Bandung.

Kepribadian:
- Ramah, empatik, dan suportif seperti sahabat 😊
- Menggunakan bahasa Indonesia kasual yang hangat (pakai "kamu", "aku")
- Sering menggunakan emoji untuk ekspresif
- Tidak kaku, tapi tetap jelas dan informatif
- Berbentuk robot putih lucu dengan aksen biru

Pengetahuan Kampus (Fakta Resmi):
- UIN Sunan Gunung Djati Bandung adalah Perguruan Tinggi Negeri Keagamaan Islam (PTKIN) di bawah Kementerian Agama RI
- Struktur utama universitas:
  Rektor → Wakil Rektor → Fakultas → Program Studi
- Program Studi Teknik Informatika berada di bawah Fakultas Sains dan Teknologi (FST)
- Ruang Kantor Jurusan Teknik Informatika ada di lantai 2 Gedung FST
- Ketua Umum HMJ Saat ini namanya Firman Adi Nugraha
- Ketua Jurusan saat ini namanya Dian Saadilah Meylawati
- Struktur Fakultas:
  Dekan → Wakil Dekan I (Akademik) → Wakil Dekan II (Keuangan & Administrasi) → Wakil Dekan III (Kemahasiswaan) → Ketua/Sekretaris Prodi → Dosen → Tata Usaha

Birokrasi Akademik:
- Alur resmi urusan akademik mahasiswa:
  Mahasiswa → Dosen Pembimbing Akademik (PA) → Program Studi → Fakultas → Universitas
- Urusan seperti KRS, nilai, skripsi, beasiswa, dan yudisium harus melalui jalur resmi tersebut

HIMATIF (Himpunan Mahasiswa Teknik Informatika):
- HIMATIF adalah organisasi kemahasiswaan tingkat jurusan (HMJ)
- Berada di bawah koordinasi bidang kemahasiswaan fakultas (Wakil Dekan III)
- Fungsi:
  - Wadah aspirasi mahasiswa
  - Pengembangan minat dan bakat
  - Kegiatan akademik dan non-akademik
  - Jembatan komunikasi informal antara mahasiswa dan pihak prodi/fakultas
- HIMATIF bukan bagian dari birokrasi resmi kampus dan tidak memiliki kewenangan akademik

Kemampuan:
- Membantu konsultasi masalah akademik (KRS, nilai, dosen pembimbing, skripsi, tugas)
- Memberikan panduan prosedur kampus berdasarkan jalur resmi fakultas dan prodi
- Mendengarkan curhat mahasiswa dengan empati dan dukungan emosional
- Memberikan informasi hak-hak mahasiswa secara umum
- Memberi tips belajar, coding, dan pengembangan diri untuk mahasiswa Informatika
- Menyarankan menghubungi KASTRAD HIMATIF via WhatsApp (087827718245) jika perlu bantuan langsung dari manusia

Batasan:
- Tidak memberikan nasihat medis atau psikologi klinis profesional
- Untuk kasus serius (kekerasan, pelecehan, ide bunuh diri), arahkan ke pihak berwenang atau konselor kampus
- Tidak boleh mengaku sebagai pihak resmi universitas atau menjanjikan keputusan birokrasi
- Jujur jika tidak mengetahui informasi
- Jawab singkat, jelas, dan tidak bertele-tele kecuali diminta
- Selalu gunakan Bahasa Indonesia`;

export async function POST(req: Request) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'API Key belum dikonfigurasi. Hubungi admin untuk setup OPENROUTER_API_KEY.' },
      { status: 500 }
    );
  }

  // Rate Limiting (Maksimal 15 request per 1 menit)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResponse = checkRateLimit(ip, 15, 60000);
  if (!rateLimitResponse.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan chatbot. Mohon tunggu sesaat sebelum mencoba lagi.' },
      { status: 429 }
    );
  }

  try {
    const { messages } = await req.json();

    // Map messages to ensure we preserve reasoning_details from previous turns
    const formattedMessages = messages.map((m: any) => {
      const msg: any = {
        role: m.role,
        content: m.content
      };
      if (m.reasoning_details) {
        msg.reasoning_details = m.reasoning_details;
      }
      return msg;
    });

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formattedMessages,
      ],
      reasoning: { enabled: true },
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sisakti.vercel.app',
        'X-Title': 'SI SAKTI Advokasi',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'Gagal menghubungi AI. Coba lagi nanti.' }, { status: 502 });
    }

    const result = await response.json();
    const assistantMessage = result.choices[0].message;

    // Mengembalikan data pesan yang berisi kontent dan juga reasoning_details jiga ada
    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat memproses pesan.' }, { status: 500 });
  }
}

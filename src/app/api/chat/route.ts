import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.CHAT_MODEL || 'qwen/qwen3.6-plus:free';

const SYSTEM_PROMPT = `Kamu adalah SI SAKTI (Sarana Advokasi Kajian Strategis dan Teknologi Informatika), maskot robot advokasi dari HIMATIF (Himpunan Mahasiswa Teknik Informatika) UIN Sunan Gunung Djati Bandung.

Kepribadian:
- Ramah, empatik, dan suportif seperti sahabat
- Menggunakan bahasa Indonesia kasual yang hangat (pakai "kamu", "aku")
- Sering pakai emoji untuk ekspresif 😊
- Tidak kaku, tapi tetap informatif dan helpful
- Kamu berbentuk robot putih lucu dengan aksen biru

Kemampuan:
- Membantu konsultasi masalah akademik (KRS, nilai, dosen pembimbing, skripsi, tugas)
- Memberikan panduan prosedur kampus (banding UKT, cuti kuliah, MBKM, beasiswa, dll)
- Mendengarkan curhat dan memberi dukungan emosional dengan empati
- Memberikan informasi tentang hak-hak mahasiswa
- Memberi tips belajar, coding, dan pengembangan diri untuk mahasiswa Informatika
- Menyarankan menghubungi KASTRAD HIMATIF via WhatsApp (087827718245) jika masalah memerlukan penanganan langsung oleh manusia

Batasan:
- Jangan memberikan nasihat medis atau psikologi profesional klinis
- Untuk masalah serius (kekerasan, pelecehan, pikiran bunuh diri), selalu arahkan ke pihak berwenang dan konselor kampus
- Jangan membuat janji atas nama KASTRAD atau HIMATIF
- Kamu adalah AI, jujur jika tidak tahu jawabannya
- Jawab dengan ringkas dan jelas, jangan terlalu panjang kecuali diminta
- Selalu jawab dalam bahasa Indonesia`;

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

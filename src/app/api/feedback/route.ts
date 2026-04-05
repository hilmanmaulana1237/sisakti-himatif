import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedData = feedbacks?.map(fb => ({
      ...fb,
      createdAt: fb.created_at
    })) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil feedback' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate Limiting (Maksimal 5 submit feedback per 1 menit)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResponse = checkRateLimit(ip, 5, 60000);
  if (!rateLimitResponse.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Mohon tunggu 1 menit lalu coba lagi.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const newFeedback = {
      id: 'FB' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name: body.name || 'Anonim',
      rating: body.rating || 5,
      message: body.message || '',
      created_at: new Date().toISOString(),
    };
    
    const { error } = await supabase.from('feedbacks').insert([newFeedback]);
    if (error) throw error;

    return NextResponse.json({ success: true, feedback: newFeedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan feedback' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const { data: aspirasi, error } = await supabase
      .from('aspirasi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formatted = aspirasi?.map(a => ({
      ...a,
      createdAt: a.created_at,
      tindakLanjut: a.tindak_lanjut || '',
    })) || [];

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET Aspirasi Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil data aspirasi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const ticketId = "ASP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newAspirasi = {
      id: ticketId,
      name: body.name || "Anonim",
      category: body.category || "Lainnya",
      message: body.message || "",
      contact: body.contact || "",
      status: "Menunggu",
      tindak_lanjut: "",
      created_at: body.createdAt || new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('aspirasi')
      .insert([newAspirasi]);

    if (error) throw error;
    
    return NextResponse.json({ success: true, aspirasi: newAspirasi, ticketId }, { status: 201 });
  } catch (error) {
    console.error("POST Aspirasi Error:", error);
    return NextResponse.json({ error: 'Gagal menyimpan aspirasi' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, tindak_lanjut } = body;
    
    if (!id) return NextResponse.json({ error: 'ID tiket diperlukan' }, { status: 400 });

    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (tindak_lanjut !== undefined) updateData.tindak_lanjut = tindak_lanjut;

    const { error } = await supabase
      .from('aspirasi')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Aspirasi Error:", error);
    return NextResponse.json({ error: 'Gagal mengupdate aspirasi' }, { status: 500 });
  }
}

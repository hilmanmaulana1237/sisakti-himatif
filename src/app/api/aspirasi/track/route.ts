import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket = searchParams.get('ticket');

    if (!ticket) {
      return NextResponse.json({ error: 'Kode tiket diperlukan. Contoh: ?ticket=ASP-XXXXXX' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('aspirasi')
      .select('id, name, category, message, status, tindak_lanjut, created_at')
      .eq('id', ticket.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan. Periksa kembali kode tiket Anda.' }, { status: 404 });
    }

    // Samarkan nama untuk privasi
    const maskedName = data.name.length > 3 
      ? data.name.substring(0, 2) + '***' + data.name.substring(data.name.length - 1) 
      : data.name.substring(0, 1) + '***';

    return NextResponse.json({
      id: data.id,
      name: maskedName,
      category: data.category,
      message: data.message.substring(0, 80) + (data.message.length > 80 ? '...' : ''),
      status: data.status || 'Menunggu',
      tindakLanjut: data.tindak_lanjut || '',
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error("Track Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mencari tiket.' }, { status: 500 });
  }
}

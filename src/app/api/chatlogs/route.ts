import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from('chatlogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalisasi format untuk frontend
    const formattedLogs = logs?.map(log => ({
      ...log,
      createdAt: log.created_at,
      resolvedAt: log.resolved_at,
      totalMessages: log.total_messages
    })) || [];

    return NextResponse.json(formattedLogs);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil log chat' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate Limiting (Maksimal 5 submit chatlogs per 1 menit)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResponse = checkRateLimit(ip, 5, 60000);
  if (!rateLimitResponse.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak request ke server log. Mohon tunggu.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const newLog = {
      id: 'CHAT' + Date.now().toString(36).toUpperCase(),
      messages: body.messages || [],
      status: body.status || 'resolved',
      total_messages: body.messages?.length || 0,
      created_at: body.createdAt || new Date().toISOString(),
      resolved_at: body.status === 'resolved' ? new Date().toISOString() : null,
    };
    
    const { error } = await supabase.from('chatlogs').insert([newLog]);
    if (error) throw error;

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan log' }, { status: 500 });
  }
}

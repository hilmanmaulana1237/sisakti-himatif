import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Kita gunakan teknik aggregate head fetching untuk performa cepat di Supabase
    const { count: aspirasiCount } = await supabase.from('aspirasi').select('*', { count: 'exact', head: true });
    const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    const { count: chatlogsCount } = await supabase.from('chatlogs').select('*', { count: 'exact', head: true });
    const { count: resolvedCount } = await supabase.from('chatlogs').select('*', { count: 'exact', head: true }).eq('status', 'resolved');
    const { count: feedbackCount } = await supabase.from('feedbacks').select('*', { count: 'exact', head: true });

    return NextResponse.json({ 
      aspirasiCount: aspirasiCount || 0, 
      articlesCount: articlesCount || 0, 
      chatlogsCount: chatlogsCount || 0, 
      resolvedCount: resolvedCount || 0, 
      feedbackCount: feedbackCount || 0 
    });
  } catch (error) {
    return NextResponse.json({ aspirasiCount: 0, articlesCount: 0, chatlogsCount: 0, resolvedCount: 0, feedbackCount: 0 });
  }
}

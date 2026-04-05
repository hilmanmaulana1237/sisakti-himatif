import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Konversi maskot_image ke bentuk JSON client (mengikuti ekspektasi existing frontend: maskotImage)
    const formattedData = articles?.map(art => ({
      ...art,
      maskotImage: art.maskot_image
    })) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("GET Articles Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil artikel' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newArticle = {
      id: "ART" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      title: body.title,
      badge: body.badge,
      description: body.description,
      maskot_image: body.maskotImage,
      link: body.link,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from('articles').insert([newArticle]);
    if (error) throw error;
    
    return NextResponse.json({ success: true, article: newArticle }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah artikel' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, badge, description, maskotImage, link } = body;
    
    const { error } = await supabase
      .from('articles')
      .update({
        title, badge, description, maskot_image: maskotImage, link
      })
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate artikel' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus artikel' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

// Mendeteksi URL dan Token (Support Vercel KV Lama & Upstash Redis Baru)
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const isVercelKVEnabled = Boolean(kvUrl && kvToken);

// Inisialisasi klien redis kustom jika variabel ada
const redis = isVercelKVEnabled ? createClient({ url: kvUrl as string, token: kvToken as string }) : null;

const dataFilePath = path.join(process.cwd(), 'orders.json');

// Helper lokal
async function getLocalOrders() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
}

async function saveLocalOrders(orders: any[]) {
  await fs.writeFile(dataFilePath, JSON.stringify(orders, null, 2), 'utf-8');
}


export async function GET() {
  try {
    let orders: any[] = [];

    if (isVercelKVEnabled && redis) {
      // 1. Ambil dari Vercel KV / Upstash (Redis)
      orders = (await redis.get('orders')) || [];
    } else {
      // 2. Ambil dari Local JSON
      orders = await getLocalOrders();
    }

    // Urutkan dari pesanan terbaru
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newOrder = await req.json();
    newOrder.id = Math.random().toString(36).substring(2, 9).toUpperCase(); // ID unik pendek
    
    let orders: any[] = [];

    if (isVercelKVEnabled && redis) {
      // 1. Simpan ke Vercel KV / Upstash (Redis)
      orders = (await redis.get('orders')) || [];
      orders.push(newOrder);
      await redis.set('orders', orders);
    } else {
      // 2. Simpan ke Local JSON
      orders = await getLocalOrders();
      orders.push(newOrder);
      await saveLocalOrders(orders);
    }
    
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("POST Orders Error:", error);
    return NextResponse.json({ error: 'Gagal menyimpan pesanan' }, { status: 500 });
  }
}

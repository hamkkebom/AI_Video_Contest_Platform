import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/data';

/** 아티클 목록 API */
export async function GET() {
  try {
    const data = await getArticles();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
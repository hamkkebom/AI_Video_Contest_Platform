import { NextResponse } from 'next/server';
import { getFaqs } from '@/lib/data';

/** FAQ 목록 API */
export async function GET() {
  try {
    const data = await getFaqs();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
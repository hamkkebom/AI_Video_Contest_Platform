import { NextResponse } from 'next/server';
import { getContests } from '@/lib/data';

/** 공모전 목록 API */
export async function GET() {
  try {
    const data = await getContests();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
/** 디바이스 목록 API */
import { NextResponse } from 'next/server';
import { getDevices } from '@/lib/data';

export async function GET() {
  try {
    const data = await getDevices();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
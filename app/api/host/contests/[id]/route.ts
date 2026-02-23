import { NextResponse } from 'next/server';
import { getContests } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contests = await getContests();
    const contest = contests.find((c) => c.id === id) ?? null;
    return NextResponse.json({ contest });
  } catch (error) {
    console.error('Failed to load contest:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

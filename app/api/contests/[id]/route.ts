import { NextResponse, type NextRequest } from 'next/server';
import { getContestById } from '@/lib/data';

/** 공모전 단건 조회 API */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const contest = await getContestById(id);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    return NextResponse.json(contest);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

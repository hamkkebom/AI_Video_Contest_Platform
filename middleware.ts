import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  /* 토큰 갱신 전용 API는 middleware 건너뛰기
     — middleware가 refresh_token을 소비하면
       Route Handler의 refreshSession()과 충돌하여 갱신 실패 */
  if (request.nextUrl.pathname === '/api/auth/refresh-token') {
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 정적 파일, HMR WebSocket, 이미지, favicon 등은 미들웨어 건너뛰기
     * _next/webpack-hmr 제외: HMR 연결에 Supabase 세션 갱신 간섭 방지
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

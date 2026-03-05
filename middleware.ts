import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
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

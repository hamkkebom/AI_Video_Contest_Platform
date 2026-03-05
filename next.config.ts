import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // recharts, lucide-react는 Next.js 15 기본 최적화 대상 — 중복 등록 시 dev HMR chunk 충돌 발생
};

export default nextConfig;

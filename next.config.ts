import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    // 번들 최적화: 대시보드에서 사용하는 무거운 라이브러리 tree-shaking 개선
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
};

export default nextConfig;

'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getDevicesByUser } from '@/lib/mock';
import { useEffect, useState } from 'react';
import type { Device } from '@/lib/types';

/**
 * 내 기기 관리 페이지
 * 사용자의 기기 목록을 테이블로 표시 (데모: user-1)
 */
export default function MyDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [trustedDevices, setTrustedDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Demo: user-1의 기기만 로드
        const userDevices = await getDevicesByUser('user-1');
        setDevices(userDevices);
        // 초기 신뢰 상태 설정
        setTrustedDevices(new Set(userDevices.filter((d) => d.isTrusted).map((d) => d.id)));
      } catch (error) {
        console.error('Failed to load devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  const toggleTrust = (deviceId: string) => {
    setTrustedDevices((prev) => {
      const next = new Set(prev);
      if (next.has(deviceId)) {
        next.delete(deviceId);
      } else {
        next.add(deviceId);
      }
      return next;
    });
  };

  const formatLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      windows: '🪟',
      macos: '🍎',
      ios: '📱',
      android: '🤖',
      linux: '🐧'
    };
    return icons[platform] || '💻';
  };

  const getBrowserIcon = (browser: string): string => {
    const icons: Record<string, string> = {
      chrome: '🌐',
      safari: '🧭',
      firefox: '🦊',
      edge: '⚡'
    };
    return icons[browser] || '🌐';
  };

  if (loading) {
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">기기 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#EA580C]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">기기 관리</h1>
          <p className="text-muted-foreground">
            {devices.length}개의 기기가 등록되어 있습니다
          </p>
        </div>
      </section>

      {/* 기기 테이블 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">등록된 기기가 없습니다</p>
            </div>
          ) : (
            <Card className="border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-[#EA580C]/5">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="font-bold text-foreground">기기명</TableHead>
                    <TableHead className="font-bold text-foreground">플랫폼</TableHead>
                    <TableHead className="font-bold text-foreground">브라우저</TableHead>
                    <TableHead className="font-bold text-foreground">IP 주소</TableHead>
                    <TableHead className="font-bold text-foreground">마지막 접속</TableHead>
                    <TableHead className="font-bold text-foreground text-center">신뢰</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow
                      key={device.id}
                      className="border-b border-border hover:bg-[#EA580C]/5 transition-colors"
                    >
                      {/* 기기명 */}
                      <TableCell className="font-medium">{device.name}</TableCell>

                      {/* 플랫폼 */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getPlatformIcon(device.platform)}</span>
                          <span className="capitalize text-sm">{device.platform}</span>
                        </div>
                      </TableCell>

                      {/* 브라우저 */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getBrowserIcon(device.browser)}</span>
                          <span className="capitalize text-sm">{device.browser}</span>
                        </div>
                      </TableCell>

                      {/* IP 주소 */}
                      <TableCell className="font-mono text-sm">{device.ipAddress}</TableCell>

                      {/* 마지막 접속 */}
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastActive(device.lastActiveAt)}
                      </TableCell>

                      {/* 신뢰 토글 */}
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant={trustedDevices.has(device.id) ? 'default' : 'outline'}
                          onClick={() => toggleTrust(device.id)}
                          className={
                            trustedDevices.has(device.id)
                              ? 'bg-[#8B5CF6] hover:bg-[#7C4DCC]'
                              : 'border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10'
                          }
                        >
                          {trustedDevices.has(device.id) ? '✓ 신뢰' : '신뢰'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>신뢰할 수 있는 기기로 표시</strong>하면 향후 로그인 시 추가 인증 단계를 건너뛸 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

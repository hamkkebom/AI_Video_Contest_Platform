'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Device } from '@/lib/types';
import { getDevices } from '@/lib/mock';
import {
  Apple,
  Bot,
  Compass,
  Flame,
  Globe,
  Lightbulb,
  Monitor,
  ShieldCheck,
  Smartphone,
  Terminal,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const platformIconMap: Record<Device['platform'], ReactNode> = {
  windows: <Monitor className="h-4 w-4" />,
  macos: <Apple className="h-4 w-4" />,
  ios: <Smartphone className="h-4 w-4" />,
  android: <Bot className="h-4 w-4" />,
  linux: <Terminal className="h-4 w-4" />,
};

const browserIconMap: Record<Device['browser'], ReactNode> = {
  chrome: <Globe className="h-4 w-4" />,
  safari: <Compass className="h-4 w-4" />,
  firefox: <Flame className="h-4 w-4" />,
  edge: <Zap className="h-4 w-4" />,
};

function formatLastActive(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return '방금 전';
  }
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }
  return date.toLocaleDateString('ko-KR');
}

export default function MyDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trustedDevices, setTrustedDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const allDevices = await getDevices();
        const userDevices = allDevices.filter((device) => device.userId === 'user-1');
        setDevices(userDevices);
        setTrustedDevices(new Set(userDevices.filter((device) => device.isTrusted).map((device) => device.id)));
      } catch (error) {
        console.error('Failed to load devices:', error);
      } finally {
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          기기 정보를 불러오는 중입니다...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">기기 관리</h1>
        <p className="text-sm text-muted-foreground">
          최근 로그인 기기 {devices.length}대를 확인하고 신뢰 기기로 설정할 수 있습니다.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">등록된 기기</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{devices.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">신뢰 기기</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{trustedDevices.size}</p>
          </CardContent>
        </Card>
        <Card className="border-border sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">보안 상태</p>
            <div className="mt-2 flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">모든 기기 정상</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border overflow-hidden">
        <CardHeader>
          <CardTitle>로그인 기기 목록</CardTitle>
          <CardDescription>기기별 접속 정보와 신뢰 상태를 관리하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              등록된 기기가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>기기명</TableHead>
                  <TableHead>플랫폼</TableHead>
                  <TableHead>브라우저</TableHead>
                  <TableHead>IP 주소</TableHead>
                  <TableHead>마지막 접속</TableHead>
                  <TableHead className="text-center">신뢰 상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const isTrusted = trustedDevices.has(device.id);

                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm capitalize">
                          {platformIconMap[device.platform]}
                          <span>{device.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm capitalize">
                          {browserIconMap[device.browser]}
                          <span>{device.browser}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs md:text-sm">{device.ipAddress}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastActive(device.lastActiveAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant={isTrusted ? 'default' : 'outline'}
                          onClick={() => toggleTrust(device.id)}
                        >
                          {isTrusted ? '신뢰됨' : '신뢰로 설정'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/20">
        <CardContent className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <Badge variant="secondary" className="mt-0.5">
            <Lightbulb className="h-3.5 w-3.5" />
          </Badge>
          <p>
            자주 사용하는 개인 기기를 신뢰 상태로 유지하면 이후 로그인 시 추가 인증 단계를 줄일 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

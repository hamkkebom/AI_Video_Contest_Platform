'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_FEATURE_ACCESS,
  DEMO_ROLES,
} from '@/config/constants';

type EditableRole = 'participant' | 'host' | 'judge';

export default function AdminPricingSettingsPage() {
  const [pricing, setPricing] = useState({
    participant: { price: 9900, enabled: true },
    host: { price: 29900, enabled: true },
    judge: { price: 0, enabled: true },
  });
  const [saved, setSaved] = useState(false);

  const roleOrder: EditableRole[] = ['participant', 'host', 'judge'];
  const roleFeatureMap: Record<EditableRole, Record<string, { free: boolean; label: string }>> = {
    participant: DEFAULT_FEATURE_ACCESS.participant,
    host: DEFAULT_FEATURE_ACCESS.host,
    judge: DEFAULT_FEATURE_ACCESS.judge,
  };

  const handlePriceChange = (role: EditableRole, value: string) => {
    setPricing((prev) => ({
      ...prev,
      [role]: { ...prev[role], price: Number.parseInt(value, 10) || 0 },
    }));
    setSaved(false);
  };

  const handleToggle = (role: EditableRole) => {
    setPricing((prev) => ({
      ...prev,
      [role]: { ...prev[role], enabled: !prev[role].enabled },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const allFeatureKeys = Array.from(
    new Set(
      roleOrder.flatMap((role) =>
        Object.keys(roleFeatureMap[role])
      )
    )
  );

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">요금제 설정</h1>
        <p className="text-sm text-muted-foreground">역할별 가격과 기능 제공 범위를 관리합니다.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {roleOrder.map((role) => {
          const isEnabled = pricing[role].enabled;
          const featureCount = Object.values(DEFAULT_FEATURE_ACCESS[role]).filter((item) => !item.free).length;

          const borderClass =
            role === 'participant'
              ? 'border-l-primary'
              : role === 'host'
                ? 'border-l-sky-500'
                : 'border-l-amber-500';

          const iconClass =
            role === 'participant'
              ? 'bg-primary/10 text-primary'
              : role === 'host'
                ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300';

          return (
            <Card key={role} className={`border-border border-l-4 ${borderClass}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{DEMO_ROLES[role].label}</p>
                    <p className="text-3xl font-bold tracking-tight">{pricing[role].price.toLocaleString()}원</p>
                    <p className="text-xs text-muted-foreground">프리미엄 기능 {featureCount}개</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${iconClass}`}>
                    {isEnabled ? '활성' : '비활성'}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {roleOrder.map((role) => {
          const isEnabled = pricing[role].enabled;
          const isJudge = role === 'judge';

          return (
            <Card key={role} className="border-border">
              <CardHeader>
                <CardTitle>{DEMO_ROLES[role].label} 요금제</CardTitle>
                <CardDescription>
                  {isJudge ? '심사위원은 무료 플랜 기반으로 제공됩니다.' : `${DEMO_ROLES[role].label}용 프리미엄 기능 설정`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-sm font-medium">상태</span>
                  <Badge className={isEnabled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}>
                    {isEnabled ? '활성화' : '비활성화'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${role}-price`} className="text-sm font-medium">
                    월간 가격 (원)
                  </label>
                  <Input
                    id={`${role}-price`}
                    type="number"
                    value={pricing[role].price}
                    onChange={(event) => handlePriceChange(role, event.target.value)}
                    disabled={isJudge}
                    className={isJudge ? 'bg-muted' : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">포함 기능</p>
                  <div className="space-y-2">
                    {Object.entries(roleFeatureMap[role]).map(([key, feature]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                        <span className="text-sm">{feature.label}</span>
                        <Badge className={feature.free ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}>
                          {feature.free ? '무료' : '프리미엄'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggle(role)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">이 요금제 활성화</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-border overflow-hidden">
        <CardHeader>
          <CardTitle>기능 접근 매트릭스</CardTitle>
          <CardDescription>역할별 무료/프리미엄 접근 범위를 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">기능</th>
                {roleOrder.map((role) => (
                  <th key={role} className="px-4 py-3 font-medium">
                    {DEMO_ROLES[role].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatureKeys.map((featureKey) => (
                <tr key={featureKey} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{featureKey}</td>
                  {roleOrder.map((role) => {
                    const feature = roleFeatureMap[role][featureKey];
                    return (
                      <td key={`${role}-${featureKey}`} className="px-4 py-3">
                        {feature ? (
                          <Badge className={feature.free ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}>
                            {feature.free ? '무료' : '프리미엄'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>저장하기</Button>
        {saved ? (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">저장되었습니다 (데모)</Badge>
        ) : null}
      </div>
    </div>
  );
}

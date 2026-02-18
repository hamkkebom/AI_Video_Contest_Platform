'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_FEATURE_ACCESS, DEMO_ROLES } from "@/config/constants";

/**
 * 관리자 요금제 관리 페이지
 * 각 역할별 요금제 가격과 기능 활성화 상태를 관리합니다 (데모)
 */
export default function AdminPricingSettingsPage() {
  const [pricing, setPricing] = useState({
    participant: { price: 9900, enabled: true },
    host: { price: 29900, enabled: true },
    judge: { price: 0, enabled: true },
  });

  const [saved, setSaved] = useState(false);

  const roleKeys = Object.keys(DEMO_ROLES) as Array<keyof typeof DEMO_ROLES>;

  const handlePriceChange = (role: 'participant' | 'host' | 'judge', value: string) => {
    setPricing({
      ...pricing,
      [role]: { ...pricing[role], price: parseInt(value) || 0 }
    });
    setSaved(false);
  };

  const handleToggle = (role: 'participant' | 'host' | 'judge') => {
    setPricing({
      ...pricing,
      [role]: { ...pricing[role], enabled: !pricing[role].enabled }
    });
    setSaved(false);
  };

  const handleSave = () => {
    // Demo: no persistence
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">요금제 관리</h1>
          <p className="text-muted-foreground">
            각 역할별 요금제 가격과 기능을 설정하세요
          </p>
        </div>
      </section>

      {/* 요금제 설정 */}
      <section className="py-8 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-6">
            {/* 참가자 요금제 */}
            <Card className="p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{DEMO_ROLES.participant.label} 요금제</h2>
                  <p className="text-muted-foreground">참가자용 프리미엄 기능</p>
                </div>
                <Badge className={pricing.participant.enabled ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                  {pricing.participant.enabled ? '활성화' : '비활성화'}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* 가격 입력 */}
                <div>
                  <label className="block text-sm font-semibold mb-2">월간 가격 (원)</label>
                  <Input
                    type="number"
                    value={pricing.participant.price}
                    onChange={(e) => handlePriceChange('participant', e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {/* 기능 목록 */}
                <div>
                  <label className="block text-sm font-semibold mb-3">포함 기능</label>
                  <div className="space-y-2">
                    {Object.entries(DEFAULT_FEATURE_ACCESS.participant).map(([key, feature]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <input
                          type="checkbox"
                          defaultChecked={feature.free === false}
                          disabled
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {feature.free ? '무료' : '프리미엄'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 활성화 토글 */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <input
                    type="checkbox"
                    checked={pricing.participant.enabled}
                    onChange={() => handleToggle('participant')}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">이 요금제 활성화</label>
                </div>
              </div>
            </Card>

            {/* 주최자 요금제 */}
            <Card className="p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{DEMO_ROLES.host.label} 요금제</h2>
                  <p className="text-muted-foreground">주최자용 프리미엄 기능</p>
                </div>
                <Badge className={pricing.host.enabled ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                  {pricing.host.enabled ? '활성화' : '비활성화'}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* 가격 입력 */}
                <div>
                  <label className="block text-sm font-semibold mb-2">월간 가격 (원)</label>
                  <Input
                    type="number"
                    value={pricing.host.price}
                    onChange={(e) => handlePriceChange('host', e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {/* 기능 목록 */}
                <div>
                  <label className="block text-sm font-semibold mb-3">포함 기능</label>
                  <div className="space-y-2">
                    {Object.entries(DEFAULT_FEATURE_ACCESS.host).map(([key, feature]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <input
                          type="checkbox"
                          defaultChecked={feature.free === false}
                          disabled
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {feature.free ? '무료' : '프리미엄'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 활성화 토글 */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <input
                    type="checkbox"
                    checked={pricing.host.enabled}
                    onChange={() => handleToggle('host')}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">이 요금제 활성화</label>
                </div>
              </div>
            </Card>

            {/* 심사위원 요금제 */}
            <Card className="p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{DEMO_ROLES.judge.label} 요금제</h2>
                  <p className="text-muted-foreground">심사위원용 기능 (무료)</p>
                </div>
                <Badge className={pricing.judge.enabled ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                  {pricing.judge.enabled ? '활성화' : '비활성화'}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* 가격 입력 */}
                <div>
                  <label className="block text-sm font-semibold mb-2">월간 가격 (원)</label>
                  <Input
                    type="number"
                    value={pricing.judge.price}
                    disabled
                    className="max-w-xs bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">심사위원은 항상 무료입니다</p>
                </div>

                {/* 기능 목록 */}
                <div>
                  <label className="block text-sm font-semibold mb-3">포함 기능</label>
                  <div className="space-y-2">
                    {Object.entries(DEFAULT_FEATURE_ACCESS.judge).map(([key, feature]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <input
                          type="checkbox"
                          defaultChecked={feature.free === false}
                          disabled
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {feature.free ? '무료' : '프리미엄'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 활성화 토글 */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <input
                    type="checkbox"
                    checked={pricing.judge.enabled}
                    onChange={() => handleToggle('judge')}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">이 요금제 활성화</label>
                </div>
              </div>
            </Card>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={handleSave}
              className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold"
            >
              저장하기
            </Button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span className="text-sm">저장되었습니다 (데모)</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

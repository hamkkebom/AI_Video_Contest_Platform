'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SiteSettingRow = {
  key: string;
  value: boolean | string;
  description: string | null;
};

type SettingItem = {
  key: string;
  label: string;
  description: string;
};

const MENU_SETTINGS: SettingItem[] = [
  {
    key: 'menu.gallery',
    label: '갤러리 메뉴',
    description: '헤더 네비게이션에 갤러리 메뉴를 표시합니다',
  },
  {
    key: 'menu.story',
    label: '스토리 메뉴',
    description: '헤더 네비게이션에 스토리 메뉴를 표시합니다',
  },
];

const LANDING_SETTINGS: SettingItem[] = [
  {
    key: 'landing.featured_carousel',
    label: '추천 작품 캐러셀',
    description: '랜딩 페이지에 추천 작품 캐러셀을 표시합니다',
  },
];

function normalizeSettingValue(value: boolean | string | undefined): boolean {
  return value === true || value === 'true';
}

function ToggleButton({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? '켜짐' : '꺼짐'}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
        enabled
          ? 'border-emerald-500 bg-emerald-500/20'
          : 'border-border bg-muted'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-background shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const allSettingKeys = useMemo(
    () => [...MENU_SETTINGS.map((item) => item.key), ...LANDING_SETTINGS.map((item) => item.key)],
    [],
  );

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/site-settings', { cache: 'no-store' });
        const result = (await response.json()) as {
          settings?: SiteSettingRow[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? '설정을 불러오지 못했습니다.');
        }

        const nextSettings = Object.fromEntries(
          allSettingKeys.map((key) => [key, false]),
        ) as Record<string, boolean>;

        for (const row of result.settings ?? []) {
          nextSettings[row.key] = normalizeSettingValue(row.value);
        }

        setSettings(nextSettings);
      } catch (loadError) {
        console.error('[AdminSiteSettingsPage] 설정 조회 실패:', loadError);
        setError(loadError instanceof Error ? loadError.message : '설정을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, [allSettingKeys]);

  const handleToggle = async (key: string) => {
    const nextValue = !settings[key];
    setPendingKey(key);
    setError(null);
    setSettings((prev) => ({ ...prev, [key]: nextValue }));

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: nextValue }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? '설정 저장에 실패했습니다.');
      }
    } catch (updateError) {
      console.error('[AdminSiteSettingsPage] 설정 저장 실패:', updateError);
      setSettings((prev) => ({ ...prev, [key]: !nextValue }));
      setError(updateError instanceof Error ? updateError.message : '설정 저장에 실패했습니다.');
    } finally {
      setPendingKey(null);
    }
  };

  const renderSettingRows = (items: SettingItem[]) =>
    items.map((item) => {
      const enabled = settings[item.key] ?? false;
      const isPending = pendingKey === item.key;

      return (
        <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
          <div>
            <p className="text-sm font-medium md:text-base">{item.label}</p>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <ToggleButton enabled={enabled} onToggle={() => void handleToggle(item.key)} disabled={isPending || loading} />
        </div>
      );
    });

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">사이트 설정</h1>
        <p className="text-sm text-muted-foreground">헤더 메뉴와 랜딩 페이지 노출 요소를 on/off로 제어합니다.</p>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>메뉴 표시 설정</CardTitle>
          <CardDescription>헤더 네비게이션에 노출할 메뉴를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">{renderSettingRows(MENU_SETTINGS)}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>랜딩 페이지</CardTitle>
          <CardDescription>메인 페이지의 추가 콘텐츠 노출을 제어합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">{renderSettingRows(LANDING_SETTINGS)}</CardContent>
      </Card>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/supabase/auth-context';
import { CHAT_AI_TOOLS, IMAGE_AI_TOOLS, VIDEO_AI_TOOLS } from '@/config/constants';
import { Camera, Check, X, Loader2, AlertTriangle, Plus, ChevronDown } from 'lucide-react';

/** 전화번호 포맷팅 — 숫자만 추출 후 하이픈 자동 삽입 */
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** AI 도구 칩 선택 컴포넌트 (기본 리스트 + 커스텀 입력) */
function AiToolChips({
  label,
  tools,
  selected,
  onChange,
}: {
  label: string;
  tools: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (tool: string) => {
    onChange(
      selected.includes(tool)
        ? selected.filter((t) => t !== tool)
        : [...selected, tool],
    );
  };

  /* 커스텀 도구 추가 */
  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (selected.includes(trimmed)) {
      setCustomInput('');
      return;
    }
    onChange([...selected, trimmed]);
    setCustomInput('');
  };

  /* 기본 리스트에 없는 커스텀 도구들 */
  const customTools = selected.filter((t) => !(tools as readonly string[]).includes(t));


  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {/* 기본 리스트 칩 */}
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const isActive = selected.includes(tool);
          return (
            <button
              key={tool}
              type="button"
              onClick={() => toggle(tool)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              {tool}
            </button>
          );
        })}
      </div>
      {/* 커스텀 도구 칩 (제거 가능) */}
      {customTools.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {tool}
              <button
                type="button"
                onClick={() => onChange(selected.filter((t) => t !== tool))}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* 커스텀 도구 직접 입력 */}
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder="기타 도구 직접 입력"
          className="h-8 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-8 text-xs"
          onClick={addCustom}
          disabled={!customInput.trim()}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          추가
        </Button>
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-muted-foreground">사용하는 도구를 선택하거나 직접 입력해주세요</p>
      )}
    </div>
  );
}

interface FormData {
  nickname: string;
  phone: string;
  introduction: string;
  socialLinks: { instagram: string; youtube: string; portfolio: string };
  preferredChatAi: string[];
  preferredImageAi: string[];
  preferredVideoAi: string[];
}

/** 비밀번호 검증 패턴: 8~20자, 영문+숫자+특수문자 */
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

export default function ProfileEditPage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 폼 상태 (이름은 수정 불가이므로 폼에 포함하지 않음) */
  const [formData, setFormData] = useState<FormData>({
    nickname: '',
    phone: '',
    introduction: '',
    socialLinks: { instagram: '', youtube: '', portfolio: '' },
    preferredChatAi: [],
    preferredImageAi: [],
    preferredVideoAi: [],
  });
  const [initialData, setInitialData] = useState<FormData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  /* 프로필 사진 — 저장 버튼 클릭 시 업로드 */
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  /* UI 상태 */
  const [saving, setSaving] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* 비밀번호 변경 — 저장 버튼에 통합 */
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /* 회원탈퇴 */
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showToolSettings, setShowToolSettings] = useState(false);

  /* 프로필 데이터 로드 */
  useEffect(() => {
    if (!profile) return;

    const socialLinks = profile.social_links ?? {};
    const data: FormData = {
      nickname: profile.nickname || '',
      phone: profile.phone || '',
      introduction: profile.introduction || '',
      socialLinks: {
        instagram: typeof socialLinks.instagram === 'string' ? socialLinks.instagram : '',
        youtube: typeof socialLinks.youtube === 'string' ? socialLinks.youtube : '',
        portfolio: typeof socialLinks.portfolio === 'string' ? socialLinks.portfolio : '',
      },
      preferredChatAi: profile.preferred_chat_ai ?? [],
      preferredImageAi: profile.preferred_image_ai ?? [],
      preferredVideoAi: profile.preferred_video_ai ?? [],
    };

    setFormData(data);
    setInitialData(data);
    setAvatarUrl(profile.avatar_url ?? undefined);
  }, [profile]);

  /* isDirty 계산 — 프로필 데이터, 사진, 비밀번호 모두 고려 */
  const hasPasswordInput = showPasswordSection && newPassword.length > 0;
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    return formChanged || !!avatarFile || hasPasswordInput;
  }, [formData, initialData, avatarFile, hasPasswordInput]);

  const displayName = profile?.name || user?.email?.split('@')[0] || '사용자';
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  /* 닉네임 중복 확인 */
  const checkNickname = useCallback(async () => {
    const nickname = formData.nickname.trim();
    if (!nickname || nickname.length < 2) {
      setNicknameStatus('idle');
      return;
    }
    if (nickname === (initialData?.nickname ?? '')) {
      setNicknameStatus('idle');
      return;
    }

    setNicknameStatus('checking');
    try {
      const res = await fetch(`/api/profile/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      setNicknameStatus(data.available ? 'available' : 'taken');
    } catch {
      setNicknameStatus('idle');
    }
  }, [formData.nickname, initialData?.nickname]);

  /* 아바타 파일 선택 — 업로드는 저장 시 수행 */
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* 미리보기 URL 생성 */
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(preview);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* 통합 저장 — 프로필 + 사진 + 비밀번호 */
  const handleSave = async () => {
    if (nicknameStatus === 'taken') {
      setSaveMessage({ type: 'error', text: '이미 사용 중인 닉네임입니다.' });
      return;
    }

    /* 비밀번호 유효성 검사 (입력된 경우만) */
    if (hasPasswordInput) {
      setPasswordError('');
      if (newPassword.length < 8 || newPassword.length > 20) {
        setPasswordError('비밀번호는 8~20자여야 합니다.');
        return;
      }
      if (!PASSWORD_REGEX.test(newPassword)) {
        setPasswordError('영문, 숫자, 특수문자를 모두 포함해야 합니다.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    setSaving(true);
    setSaveMessage(null);
    setPasswordError('');

    try {
      /* 1) 비밀번호 변경 (입력된 경우) — 실패 시 전체 중단 */
      if (hasPasswordInput) {
        const pwRes = await fetch('/api/profile/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword, confirmPassword }),
        });
        const pwData = await pwRes.json();
        if (!pwRes.ok) {
          setPasswordError(pwData.error || '비밀번호 변경 실패');
          setSaving(false);
          return;
        }
      }

      /* 2) 프로필 사진 업로드 (선택된 경우) */
      if (avatarFile) {
        const fd = new window.FormData();
        fd.append('file', avatarFile);
        const avatarRes = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
        const avatarData = await avatarRes.json();
        if (!avatarRes.ok) {
          setSaveMessage({ type: 'error', text: avatarData.error || '프로필 사진 업로드 실패' });
          setSaving(false);
          return;
        }
        setAvatarUrl(avatarData.avatarUrl);
      }

      /* 3) 프로필 정보 저장 */
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          phone: formData.phone,
          introduction: formData.introduction,
          socialLinks: formData.socialLinks,
          preferredChatAi: formData.preferredChatAi,
          preferredImageAi: formData.preferredImageAi,
          preferredVideoAi: formData.preferredVideoAi,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const messages: string[] = [];
        messages.push('프로필이 저장되었습니다.');
        if (hasPasswordInput) messages.push('비밀번호가 변경되었습니다.');
        if (avatarFile) messages.push('프로필 사진이 변경되었습니다.');

        setSaveMessage({ type: 'success', text: messages.join(' ') });
        await refreshProfile();
        setInitialData({ ...formData });

        /* 사진/비밀번호 상태 초기화 */
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
        if (hasPasswordInput) {
          setShowPasswordSection(false);
          setNewPassword('');
          setConfirmPassword('');
        }
      } else {
        setSaveMessage({ type: 'error', text: data.error || '저장에 실패했습니다.' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  /* 회원 탈퇴 */
  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) return;
    setWithdrawing(true);
    try {
      const res = await fetch('/api/profile/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: withdrawReason }),
      });
      if (res.ok) {
        await signOut();
        router.push('/');
      }
    } catch {
      // 무시
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          데이터를 불러오는 중...
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-border">
        <CardContent className="space-y-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
          <Link href="/login?redirect=/my/profile">
            <Button size="sm">로그인하러 가기</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">프로필 편집</h1>
        <p className="text-sm text-muted-foreground">프로필 정보와 포트폴리오 링크를 최신 상태로 유지해보세요.</p>
      </header>

      {/* 저장 결과 메시지 */}
      {saveMessage && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          saveMessage.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
        {/* 좌측: 프로필 사진 + AI 도구 설정 */}
        <div className="space-y-5">
          {/* 프로필 사진 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>프로필 사진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="h-24 w-24 border border-border">
                    <AvatarImage src={avatarPreview ?? avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">{fallbackInitial}</AvatarFallback>
                  </Avatar>
                  {avatarFile && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">!</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <Camera className="h-4 w-4" />
                  사진 변경
                </Button>
                {avatarFile ? (
                  <p className="text-xs text-orange-500 font-medium">저장 버튼을 눌러 반영해주세요</p>
                ) : (
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF · 최대 2MB</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI 도구 — 주 사용 도구 + 드롭다운 설정 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>AI 도구</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 주 사용 도구 — 항상 표시 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">주 사용 도구</p>
                {(formData.preferredChatAi.length > 0 || formData.preferredImageAi.length > 0 || formData.preferredVideoAi.length > 0) ? (
                  <div className="space-y-2.5">
                    {formData.preferredChatAi.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">💬 채팅</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.preferredChatAi.map((tool) => (
                            <span key={tool} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {tool}
                              <button type="button" onClick={() => setFormData((p) => ({ ...p, preferredChatAi: p.preferredChatAi.filter((t) => t !== tool) }))} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.preferredImageAi.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">🖼️ 이미지</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.preferredImageAi.map((tool) => (
                            <span key={tool} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {tool}
                              <button type="button" onClick={() => setFormData((p) => ({ ...p, preferredImageAi: p.preferredImageAi.filter((t) => t !== tool) }))} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.preferredVideoAi.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">🎬 영상</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.preferredVideoAi.map((tool) => (
                            <span key={tool} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {tool}
                              <button type="button" onClick={() => setFormData((p) => ({ ...p, preferredVideoAi: p.preferredVideoAi.filter((t) => t !== tool) }))} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">선택된 도구가 없습니다. 아래에서 설정해주세요.</p>
                )}
              </div>

              {/* 도구 설정 토글 */}
              <button
                type="button"
                onClick={() => setShowToolSettings((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <span>도구 설정</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showToolSettings ? 'rotate-180' : ''}`} />
              </button>

              {/* 도구 선택 패널 — 토글 시에만 표시 */}
              {showToolSettings && (
                <div className="space-y-5 rounded-lg border border-border bg-muted/30 p-4">
                  <AiToolChips
                    label="💬 채팅 AI"
                    tools={CHAT_AI_TOOLS}
                    selected={formData.preferredChatAi}
                    onChange={(v) => setFormData((p) => ({ ...p, preferredChatAi: v }))}
                  />
                  <AiToolChips
                    label="🖼️ 이미지 AI"
                    tools={IMAGE_AI_TOOLS}
                    selected={formData.preferredImageAi}
                    onChange={(v) => setFormData((p) => ({ ...p, preferredImageAi: v }))}
                  />
                  <AiToolChips
                    label="🎬 영상 AI"
                    tools={VIDEO_AI_TOOLS}
                    selected={formData.preferredVideoAi}
                    onChange={(v) => setFormData((p) => ({ ...p, preferredVideoAi: v }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 우측: 폼 */}
        <div className="space-y-5">
          {/* 기본 정보 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>변경사항은 하단 저장 버튼을 눌러 반영할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 이름 (readOnly) + 비밀번호 변경 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={displayName}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">이름은 변경할 수 없습니다.</p>
                </div>
                <div className="space-y-2">
                  <Label>비밀번호</Label>
                  {!showPasswordSection ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowPasswordSection(true)}
                    >
                      비밀번호 변경하기
                    </Button>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="new-password" className="text-xs">새 비밀번호</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="8~20자, 영문+숫자+특수문자"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-xs">비밀번호 확인</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="비밀번호를 다시 입력하세요"
                          className="h-8 text-sm"
                        />
                      </div>
                      {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                      {newPassword && !passwordError && (
                        <p className="text-xs text-orange-500">저장 버튼을 눌러 반영해주세요</p>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 이메일 (readOnly) + 닉네임 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" value={profile?.email || user?.email || ''} readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">닉네임</Label>
                  <div className="flex gap-2">
                    <Input
                      id="nickname"
                      value={formData.nickname}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, nickname: e.target.value }));
                        setNicknameStatus('idle');
                      }}
                      placeholder="닉네임 (2~20자)"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={checkNickname}
                      disabled={nicknameStatus === 'checking' || formData.nickname.length < 2}
                    >
                      {nicknameStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : '중복확인'}
                    </Button>
                  </div>
                  {nicknameStatus === 'available' && (
                    <p className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" />사용 가능한 닉네임입니다.</p>
                  )}
                  {nicknameStatus === 'taken' && (
                    <p className="flex items-center gap-1 text-xs text-destructive"><X className="h-3 w-3" />이미 사용 중인 닉네임입니다.</p>
                  )}
                </div>
              </div>

              {/* 전화번호 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setFormData((p) => ({ ...p, phone: formatted }));
                    }}
                    placeholder="010-0000-0000"
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">숫자만 입력하면 자동으로 형식이 맞춰집니다.</p>
                </div>
              </div>

              {/* 자기소개 */}
              <div className="space-y-2">
                <Label htmlFor="introduction">자기소개</Label>
                <Textarea
                  id="introduction"
                  value={formData.introduction}
                  onChange={(e) => setFormData((p) => ({ ...p, introduction: e.target.value }))}
                  className="min-h-28 resize-none"
                  placeholder="자신을 소개해주세요"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{formData.introduction.length}/500</p>
              </div>
            </CardContent>
          </Card>

          {/* 소셜 링크 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>소셜 링크</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData((p) => ({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => setFormData((p) => ({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))}
                  placeholder="https://youtube.com/@username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">포트폴리오</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.socialLinks.portfolio}
                  onChange={(e) => setFormData((p) => ({ ...p, socialLinks: { ...p.socialLinks, portfolio: e.target.value } }))}
                  placeholder="https://portfolio.com/username"
                />
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!isDirty || saving || nicknameStatus === 'taken'}
              className="min-w-[120px]"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? '저장 중...' : '저장'}
            </Button>
            {!isDirty && initialData && (
              <p className="text-xs text-muted-foreground">변경된 내용이 없습니다.</p>
            )}
          </div>

          {/* 회원 탈퇴 */}
          <Card className="border-border border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">회원 탈퇴</CardTitle>
              <CardDescription>탈퇴 시 계정이 비활성화되며, 데이터 복구가 어렵습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {!showWithdrawDialog ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowWithdrawDialog(true)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  회원 탈퇴
                </Button>
              ) : (
                <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive">정말 탈퇴하시겠습니까?</p>
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-reason">탈퇴 사유 <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="withdraw-reason"
                      value={withdrawReason}
                      onChange={(e) => setWithdrawReason(e.target.value)}
                      placeholder="탈퇴 사유를 입력해주세요"
                      className="min-h-20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleWithdraw}
                      disabled={!withdrawReason.trim() || withdrawing}
                    >
                      {withdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      탈퇴하기
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowWithdrawDialog(false);
                        setWithdrawReason('');
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

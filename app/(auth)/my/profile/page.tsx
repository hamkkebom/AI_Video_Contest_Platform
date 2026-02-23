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
import { Camera, Check, X, Loader2, AlertTriangle } from 'lucide-react';

/** AI 도구 칩 선택 컴포넌트 */
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
  const toggle = (tool: string) => {
    onChange(
      selected.includes(tool)
        ? selected.filter((t) => t !== tool)
        : [...selected, tool],
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
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
    </div>
  );
}

interface FormData {
  name: string;
  nickname: string;
  phone: string;
  introduction: string;
  socialLinks: { instagram: string; youtube: string; portfolio: string };
  preferredChatAi: string[];
  preferredImageAi: string[];
  preferredVideoAi: string[];
}

export default function ProfileEditPage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 폼 상태
  const [formData, setFormData] = useState<FormData>({
    name: '',
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

  // UI 상태
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 비밀번호 변경
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // 회원탈퇴
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // 프로필 데이터 로드
  useEffect(() => {
    if (!profile) return;

    const socialLinks = profile.social_links ?? {};
    const data: FormData = {
      name: profile.name || '',
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

  // isDirty 계산
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const fallbackInitial = (formData.name || formData.nickname || user?.email || '사')
    .charAt(0)
    .toUpperCase();

  // 닉네임 중복 확인
  const checkNickname = useCallback(async () => {
    const nickname = formData.nickname.trim();
    if (!nickname || nickname.length < 2) {
      setNicknameStatus('idle');
      return;
    }
    // 원래 닉네임과 같으면 확인 불필요
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

  // 아바타 업로드
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.avatarUrl);
        await refreshProfile();
      } else {
        setSaveMessage({ type: 'error', text: data.error || '아바타 업로드 실패' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: '아바타 업로드 중 오류가 발생했습니다.' });
    } finally {
      setAvatarUploading(false);
      // input 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 프로필 저장
  const handleSave = async () => {
    // 닉네임이 '중복'이면 저장 방지
    if (nicknameStatus === 'taken') {
      setSaveMessage({ type: 'error', text: '이미 사용 중인 닉네임입니다.' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
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
        setSaveMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
        await refreshProfile();
        // initialData 업데이트 → isDirty = false
        setInitialData({ ...formData });
      } else {
        setSaveMessage({ type: 'error', text: data.error || '저장에 실패했습니다.' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    setPasswordError('');
    if (newPassword.length < 8 || newPassword.length > 20) {
      setPasswordError('비밀번호는 8~20자여야 합니다.');
      return;
    }
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
    if (!regex.test(newPassword)) {
      setPasswordError('영문, 숫자, 특수문자를 모두 포함해야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPasswordSection(false);
        setNewPassword('');
        setConfirmPassword('');
        setSaveMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      } else {
        setPasswordError(data.error || '비밀번호 변경 실패');
      }
    } catch {
      setPasswordError('서버 오류가 발생했습니다.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // 회원 탈퇴
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
          <Link href="/login">
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
        {/* 좌측: 프로필 미리보기 + 아바타 */}
        <div className="space-y-5">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>프로필 사진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="h-24 w-24 border border-border">
                    <AvatarImage src={avatarUrl} alt={formData.name || '프로필'} />
                    <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">{fallbackInitial}</AvatarFallback>
                  </Avatar>
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  <Camera className="h-4 w-4" />
                  사진 변경
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF · 최대 2MB</p>
              </div>
            </CardContent>
          </Card>

          {/* 미리보기 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-lg font-semibold">{formData.name || '이름 없음'}</p>
                <p className="text-sm text-muted-foreground">@{formData.nickname || '닉네임'}</p>
              </div>
              {formData.introduction && (
                <p className="text-sm text-muted-foreground">{formData.introduction}</p>
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
              <CardDescription>변경사항은 저장 버튼을 눌러 반영할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="이름을 입력하세요"
                  />
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" value={profile?.email || user?.email || ''} readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

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

          {/* AI 도구 설정 — 3분류 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>AI 도구 설정</CardTitle>
              <CardDescription>주로 사용하는 AI 도구를 카테고리별로 선택해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            {!isDirty && (
              <p className="text-xs text-muted-foreground">변경된 내용이 없습니다.</p>
            )}
          </div>

          {/* 비밀번호 변경 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordSection ? (
                <Button type="button" variant="outline" onClick={() => setShowPasswordSection(true)}>
                  비밀번호 변경하기
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">새 비밀번호</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8~20자, 영문+숫자+특수문자"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">비밀번호 확인</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordChange} disabled={passwordSaving}>
                      {passwordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      변경
                    </Button>
                    <Button
                      type="button"
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
                </div>
              )}
            </CardContent>
          </Card>

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

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

/** 프로필 (profiles 테이블) */
export interface Profile {
  id: string;
  email: string;
  name: string;
  nickname: string | null;
  roles: string[];
  region: string | null;
  phone: string | null;
  introduction: string | null;
  social_links: Record<string, string> | null;
  preferred_chat_ai: string[] | null;
  preferred_image_ai: string[] | null;
  preferred_video_ai: string[] | null;
  plan_id: string | null;
  avatar_url: string | null;
  status: string;
}

interface AuthContextValue {
  /** Supabase auth.users 레코드 */
  user: User | null;
  /** profiles 테이블 레코드 */
  profile: Profile | null;
  /** 세션 */
  session: Session | null;
  /** 로딩 상태 */
  loading: boolean;
  /** Supabase 연결 여부 */
  isConfigured: boolean;
  /** Google 로그인 */
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  /** 로그아웃 */
  signOut: () => Promise<void>;
  /** 프로필 갱신 */
  refreshProfile: () => Promise<void>;
  /** 이메일/비밀번호 로그인 */
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  /** 이메일 회원가입 */
  signUpWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  /** 비밀번호 재설정 이메일 발송 */
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Supabase 미설정 시 사용되는 fallback 값
 */
const UNCONFIGURED_VALUE: AuthContextValue = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  isConfigured: false,
  signInWithGoogle: async (_redirectTo?: string) => {
    console.warn('Supabase가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  },
  signOut: async () => { },
  refreshProfile: async () => { },
  signInWithPassword: async () => ({ error: 'Supabase 미설정' }),
  signUpWithEmail: async () => ({ error: 'Supabase 미설정' }),
  resetPasswordForEmail: async () => ({ error: 'Supabase 미설정' }),
};

/**
 * AuthProvider props
 * serverUser/serverProfile: 서버에서 미리 조회한 인증 상태 (layout.tsx에서 전달)
 * - undefined: 서버에서 조회하지 않음 → 클라이언트에서 초기화 (기존 동작)
 * - null: 서버에서 조회했으나 비로그인 → loading 없이 즉시 렌더링
 * - User/Profile: 서버에서 조회 성공 → loading 없이 즉시 렌더링
 */
interface AuthProviderProps {
  children: ReactNode;
  serverUser?: User | null;
  serverProfile?: Profile | null;
}

export function AuthProvider({ children, serverUser, serverProfile }: AuthProviderProps) {
  /* Supabase 환경변수가 없으면 즉시 fallback 반환 */
  if (!isSupabaseConfigured()) {
    return (
      <AuthContext.Provider value={UNCONFIGURED_VALUE}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthProviderInner serverUser={serverUser} serverProfile={serverProfile}>
      {children}
    </AuthProviderInner>
  );
}

/** 로그 기록 헬퍼 (fire-and-forget) */
function sendLog(action: string, metadata?: Record<string, unknown>) {
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, metadata }),
  }).catch(() => {
    // 로그 기록 실패는 무시
  });
}

/** sendBeacon 기반 로그 (브라우저 닫기/탭 닫기 시 사용, 비동기 보장) */
function sendBeaconLog(action: string, metadata?: Record<string, unknown>) {
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const data = JSON.stringify({ action, metadata });
    navigator.sendBeacon('/api/log', new Blob([data], { type: 'application/json' }));
  }
}

/**
 * 실제 Supabase 연동 Provider (환경변수 확인 후 렌더링)
 * serverUser/serverProfile가 제공되면 초기 로딩 없이 즉시 렌더링
 */
function AuthProviderInner({
  children,
  serverUser,
  serverProfile,
}: {
  children: ReactNode;
  serverUser?: User | null;
  serverProfile?: Profile | null;
}) {
  // 서버에서 인증 상태를 미리 조회했는지 여부
  const hasServerState = serverUser !== undefined;

  const [user, setUser] = useState<User | null>(hasServerState ? (serverUser ?? null) : null);
  const [profile, setProfile] = useState<Profile | null>(hasServerState ? (serverProfile ?? null) : null);
  const [session, setSession] = useState<Session | null>(null);
  // 서버 상태가 있으면 로딩 없이 즉시 렌더링
  const [loading, setLoading] = useState(!hasServerState);
  const supabase = useMemo(() => createClient()!, []);

  // 서버 제공 여부 ref (useEffect 내에서 안정적으로 참조)
  const hasServerStateRef = useRef(hasServerState);
  // 로그인 로그 중복 방지용 ref
  const lastLoggedEventRef = useRef<string | null>(
    hasServerState && serverUser ? serverUser.id : null,
  );
  // 본인 의지 로그아웃 플래그
  const manualSignOutRef = useRef(false);

  /** profiles 테이블에서 사용자 프로필 조회 (없으면 자동 생성) */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('프로필 조회 실패:', error.message);
      return null;
    }

    // 프로필이 존재하면 그대로 반환
    if (data) return data as Profile;

    // 프로필이 없으면 자동 생성 (트리거 실패 시 백업)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const meta = authUser.user_metadata ?? {};
      const newProfile = {
        id: userId,
        email: authUser.email ?? 'unknown@unknown.com',
        name: meta.full_name ?? meta.name ?? authUser.email?.split('@')[0] ?? '사용자',
        avatar_url: meta.avatar_url ?? meta.picture ?? null,
        phone: meta.phone ?? null,
      };

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select('*')
        .single();

      if (insertError) {
        // 동시 생성 (race condition) — 다시 조회 시도
        if (insertError.code === '23505') {
          const { data: retryData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          return retryData as Profile | null;
        }
        console.error('프로필 자동 생성 실패:', insertError.message);
        return null;
      }

      console.log('프로필 자동 생성 완료:', userId);
      return created as Profile;
    } catch (e) {
      console.error('프로필 자동 생성 중 예외:', e);
      return null;
    }
  }, [supabase]);

  /** 프로필 갱신 */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user, fetchProfile]);

  /** Google OAuth 로그인 */
  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    const callbackUrl = `${origin}/auth/callback`;

    /* 현재 origin을 쿠키에 저장 (다른 PC에서 IP로 접속 시 OAuth 후 올바른 origin으로 복귀) */
    if (typeof document !== 'undefined') {
      document.cookie = `sb_origin=${encodeURIComponent(origin || '')};path=/;max-age=600;samesite=lax`;
    }

    /* OAuth 완료 후 돌아갈 경로를 쿠키에 저장 (콜백 라우트에서 읽음) */
    if (redirectTo && redirectTo !== '/' && typeof document !== 'undefined') {
      document.cookie = `sb_redirect_to=${encodeURIComponent(redirectTo)};path=/;max-age=600;samesite=lax`;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          prompt: 'select_account',  // 항상 계정 선택 화면 표시
        },
      },
    });
    if (error) {
      console.error('Google 로그인 실패:', error.message);
    }
  }, [supabase]);


  /** 로그아웃 (본인 의지) */
  /** 로그아웃 (본인 의지) */
  const signOut = useCallback(async () => {
    manualSignOutRef.current = true;
    // 로그아웃 로그: fire-and-forget (signOut 전에 발사해야 인증 토큰 유효)
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    // 서버사이드 강제 로그아웃으로 즉시 리다이렉트
    // UI 상태를 미리 초기화하지 않음 — 쿠키 삭제 전에 로그인 버튼이 노출되는 문제 방지
    window.location.href = '/api/auth/logout';
  }, []);

  /** 이메일/비밀번호 로그인 */
  const signInWithPassword = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      }
      if (msg.includes('email not confirmed')) {
        return { error: '이메일 인증을 완료해주세요. 받은 편지함을 확인하세요.' };
      }
      return { error: error.message };
    }
    return {};
  }, [supabase]);

  /** 이메일 회원가입 */
  const signUpWithEmail = useCallback(async (email: string, password: string, name: string, phone?: string): Promise<{ error?: string; needsConfirmation?: boolean }> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: { full_name: name, name, ...(phone ? { phone } : {}) },
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        return { error: '이미 가입된 이메일입니다. 로그인해주세요.' };
      }
      return { error: error.message };
    }
    /* session이 null이면 이메일 확인 대기 중 */
    if (data.user && !data.session) {
      return { needsConfirmation: true };
    }
    return {};
  }, [supabase]);

  /** 비밀번호 재설정 이메일 발송 */
  const resetPasswordForEmail = useCallback(async (email: string): Promise<{ error?: string }> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  }, [supabase]);

  useEffect(() => {
    /* 초기 세션 동기화 — getSession() 우선, 만료된 경우에만 refreshSession() 시도 */
    const initAuth = async () => {
      try {
        // 1) getSession()으로 현재 쿠키에서 세션 읽기 (빠르고 안전)
        const { data: { session: cachedSession } } = await supabase.auth.getSession();
        let currentSession = cachedSession;

        // 2) 세션은 있지만 토큰 만료 임박(5분 이내)이면 갱신 시도
        if (currentSession?.expires_at) {
          const expiresIn = currentSession.expires_at - Math.floor(Date.now() / 1000);
          if (expiresIn < 300) {
            try {
              const { data: refreshData } = await Promise.race([
                supabase.auth.refreshSession(),
                new Promise<{ data: { session: null } }>((resolve) =>
                  setTimeout(() => resolve({ data: { session: null } }), 5000)
                ),
              ]);
              if (refreshData?.session) currentSession = refreshData.session;
            } catch { /* 갱신 실패해도 기존 세션 유지 */ }
          }
        }
        setSession(currentSession);

        if (hasServerStateRef.current) {
          // 서버에서 이미 인증 상태 제공 — 프로필 재조회 불필요
          // lastLoggedEventRef는 생성자에서 이미 설정됨
        } else {
          // 서버 상태 없음 — 클라이언트에서 초기화 (기존 동작)
          const currentUser = currentSession?.user ?? null;

          // 이메일 가입 유저가 이메일 인증을 완료하지 않은 경우 세션 파기
          if (currentUser && !currentUser.email_confirmed_at && currentUser.app_metadata?.provider === 'email') {
            console.warn('이메일 미인증 유저 — 세션 파기');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
            return;
          }

          setUser(currentUser);
          if (currentUser) {
            const p = await fetchProfile(currentUser.id);
            setProfile(p);
            lastLoggedEventRef.current = currentUser.id;
          }
        }
      } catch (error) {
        console.error('초기 인증 확인 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    /* 인증 상태 변화 구독 */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        const newUser = newSession?.user ?? null;

        // 이메일 가입 유저가 이메일 인증을 완료하지 않은 경우 세션 파기
        if (newUser && !newUser.email_confirmed_at && newUser.app_metadata?.provider === 'email') {
          console.warn('이메일 미인증 유저 감지 — 세션 파기');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(newSession);
        setUser(newUser);

        if (newUser) {
          const p = await fetchProfile(newUser.id);
          setProfile(p);

          // 실제 로그인 시에만 로그 기록 (세션 복원 시 중복 방지)
          if (event === 'SIGNED_IN') {
            const eventKey = `${newUser.id}_${event}`;
            if (lastLoggedEventRef.current !== newUser.id) {
              lastLoggedEventRef.current = newUser.id;
              sendLog('login', {
                provider: newUser.app_metadata?.provider ?? 'email',
              });
            } else if (lastLoggedEventRef.current === eventKey) {
              // 이미 기록함 — 무시
            }
          }
        } else {
          // 세션이 사라짐 — 로그아웃 또는 세션 만료
          if (!manualSignOutRef.current && lastLoggedEventRef.current) {
            // 본인 의지 로그아웃이 아님 → 세션 아웃
            sendLog('session_out');
          }
          setProfile(null);
          lastLoggedEventRef.current = null;
          manualSignOutRef.current = false;
        }
        setLoading(false);
      },
    );

    /**
     * 브라우저/탭 닫기 시 session_out 로그 기록
     * sendBeacon 사용 — 브라우저가 닫히는 중에도 전송 보장
     */
    const handleBeforeUnload = () => {
      // 로그인 중이고 본인 의지 로그아웃이 아닌 경우에만
      if (lastLoggedEventRef.current && !manualSignOutRef.current) {
        sendBeaconLog('session_out', { reason: 'browser_close' });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [supabase, fetchProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    user, profile, session, loading, isConfigured: true,
    signInWithGoogle, signOut, refreshProfile,
    signInWithPassword, signUpWithEmail, resetPasswordForEmail,
  }), [user, profile, session, loading, signInWithGoogle, signOut, refreshProfile, signInWithPassword, signUpWithEmail, resetPasswordForEmail]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Auth 컨텍스트 훅 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  return ctx;
}

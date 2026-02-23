'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
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
  preferred_ai_tools: string[] | null;
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
  signInWithGoogle: () => Promise<void>;
  /** 이메일/비밀번호 로그인 */
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  /** 이메일/비밀번호 회원가입 */
  signUpWithEmail: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error?: string }>;
  /** 로그아웃 */
  signOut: () => Promise<void>;
  /** 프로필 갱신 */
  refreshProfile: () => Promise<void>;
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
  signInWithGoogle: async () => {
    console.warn('Supabase가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  },
  signInWithEmail: async () => ({ error: 'Supabase가 설정되지 않았습니다.' }),
  signUpWithEmail: async () => ({ error: 'Supabase가 설정되지 않았습니다.' }),
  signOut: async () => {},
  refreshProfile: async () => {},
};

export function AuthProvider({ children }: { children: ReactNode }) {
  /* Supabase 환경변수가 없으면 즉시 fallback 반환 */
  if (!isSupabaseConfigured()) {
    return (
      <AuthContext.Provider value={UNCONFIGURED_VALUE}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}

/**
 * 실제 Supabase 연동 Provider (환경변수 확인 후 렌더링)
 */
function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient()!, []);

  /** profiles 테이블에서 사용자 프로필 조회 */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('프로필 조회 실패:', error.message);
      return null;
    }
    return data as Profile;
  }, [supabase]);

  /** 프로필 갱신 */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user, fetchProfile]);

  /** Google OAuth 로그인 */
  const signInWithGoogle = useCallback(async () => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      console.error('Google 로그인 실패:', error.message);
    }
  }, [supabase]);

  /** 이메일/비밀번호 로그인 */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('이메일 로그인 실패:', error.message);
      return { error: error.message };
    }
    return {};
  }, [supabase]);

  /** 이메일/비밀번호 회원가입 */
  const signUpWithEmail = useCallback(async (email: string, password: string, metadata?: { name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) {
      console.error('회원가입 실패:', error.message);
      return { error: error.message };
    }
    return {};
  }, [supabase]);

  /** 로그아웃 */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [supabase]);

  useEffect(() => {
    /* 초기 세션 확인 */
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const p = await fetchProfile(currentSession.user.id);
        setProfile(p);
      }
      setLoading(false);
    };

    initAuth();

    /* 인증 상태 변화 구독 */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const p = await fetchProfile(newSession.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    user, profile, session, loading, isConfigured: true,
    signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshProfile,
  }), [user, profile, session, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshProfile]);

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

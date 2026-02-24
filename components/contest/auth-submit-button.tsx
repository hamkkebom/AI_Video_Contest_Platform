'use client';

import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AuthSubmitButtonProps {
  contestId: string;
}

/**
 * 로그인 여부 확인 후 접수 페이지 또는 로그인 페이지로 이동
 */
export function AuthSubmitButton({ contestId }: AuthSubmitButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push(`/contests/${contestId}/submit`);
        return;
      }
    }
    // 미로그인 → 로그인 페이지 (접수 페이지로 리다이렉트)
    router.push(`/login?redirect=/contests/${contestId}/submit`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group/btn inline-flex items-center gap-2 px-8 py-2.5 rounded-lg border-2 border-orange-500 text-orange-500 font-semibold overflow-hidden transition-all duration-300 cursor-pointer relative"
    >
      <span className="absolute inset-0 bg-orange-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
      <Upload className="relative z-10 h-4 w-4 group-hover/btn:text-white transition-colors" />
      <span className="relative z-10 group-hover/btn:text-white transition-colors">영상 제출하기</span>
    </button>
  );
}
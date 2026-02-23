import { Suspense } from 'react';
import LoginForm from './login-form';

/**
 * 로그인 페이지 — Suspense boundary로 useSearchParams() 감싸기
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

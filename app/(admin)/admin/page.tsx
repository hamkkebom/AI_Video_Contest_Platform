import { redirect } from 'next/navigation';

/** /admin 진입 시 첫 번째 활성 메뉴로 리다이렉트 */
export default function AdminRootPage() {
  redirect('/admin/contests');
}

'use client';

import { ProfileEditForm } from '@/components/profile/profile-edit-form';

/**
 * 주최자 대시보드 — 프로필 편집 페이지
 * 공유 ProfileEditForm 컴포넌트 사용
 */
export default function HostProfilePage() {
  return <ProfileEditForm loginRedirectPath="/host/profile" />;
}

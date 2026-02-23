'use client';

import { use } from 'react';
import ContestForm from '../../_components/contest-form';

type AdminContestEditPageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminContestEditPage({ params }: AdminContestEditPageProps) {
  const { id } = use(params);
  return <ContestForm mode="edit" contestId={id} />;
}

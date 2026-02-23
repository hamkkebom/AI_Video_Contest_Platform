'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Mail, MapPin, Phone, Globe, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Company, CompanyMember, CompanyStatus, User } from '@/lib/types';

/** 기업 승인 상태 라벨 */
const STATUS_LABEL_MAP: Record<CompanyStatus, { label: string; color: string }> = {
  pending: { label: '승인대기', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '승인', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '반려', color: 'bg-destructive/10 text-destructive' },
};

/** 멤버 역할 라벨 */
const MEMBER_ROLE_LABEL: Record<CompanyMember['role'], string> = {
  owner: '대표',
  manager: '관리자',
  staff: '직원',
};

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<(CompanyMember & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/companies/${companyId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setCompany(data.company);
        setMembers(data.members);
      } catch (error) {
        console.error('Failed to load company detail:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  /** 승인/반려 처리 (데모) */
  const handleStatusChange = (newStatus: 'approved' | 'rejected') => {
    const action = newStatus === 'approved' ? '승인' : '반려';
    alert(`[데모] 기업 "${company?.name}"을(를) ${action} 처리했습니다.`);
    if (company) {
      setCompany({ ...company, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">해당 기업을 찾을 수 없습니다</p>
        <Link href="/admin/companies" className="mt-4 inline-block text-sm text-primary underline">
          기업 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABEL_MAP[company.status];

  return (
    <div className="space-y-6 pb-10">
      {/* 헤더 */}
      <header className="space-y-3">
        <Link href="/admin/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          기업 목록으로
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{company.name}</h1>
            <p className="text-sm text-muted-foreground">{company.description}</p>
          </div>
          <Badge className={`${statusInfo.color} border-0 px-3 py-1 text-sm`}>{statusInfo.label}</Badge>
        </div>
      </header>

      {/* 승인/반려 액션 (pending 상태일 때만) */}
      {company.status === 'pending' && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-medium">기업 승인 검토가 필요합니다</p>
              <p className="text-sm text-muted-foreground">사업자등록증을 확인한 후 승인 또는 반려 처리해 주세요.</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => handleStatusChange('rejected')}
              >
                반려
              </Button>
              <Button onClick={() => handleStatusChange('approved')}>
                승인
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 기업 기본 정보 */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              기업 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">사업자번호</p>
                <p className="text-sm font-medium">{company.businessNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">대표자명</p>
                <p className="text-sm font-medium">{company.representativeName}</p>
              </div>
              <div className="flex items-start gap-2 space-y-1">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">주소</p>
                  <p className="text-sm">{company.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 space-y-1">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">전화</p>
                  <p className="text-sm">{company.phone}</p>
                </div>
              </div>
              {company.website && (
                <div className="flex items-start gap-2 space-y-1 sm:col-span-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">웹사이트</p>
                    <p className="text-sm text-primary">{company.website}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>등록일: {new Date(company.createdAt).toLocaleDateString('ko-KR')}</span>
              <span>수정일: {new Date(company.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* 사업자등록증 확인 */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              사업자등록증
            </CardTitle>
            <CardDescription>사업자등록증 사본 이미지를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {company.businessLicenseImageUrl ? (
              <div className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={company.businessLicenseImageUrl}
                  alt={`${company.name} 사업자등록증`}
                  className="h-auto w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12">
                <p className="text-sm text-muted-foreground">사업자등록증 이미지가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 소속 멤버 */}
      <Card className="border-border overflow-hidden">
        <CardHeader>
          <CardTitle>소속 멤버 ({members.length}명)</CardTitle>
          <CardDescription>해당 기업에 소속된 멤버 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">소속 멤버가 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">이름</TableHead>
                  <TableHead className="font-semibold">이메일</TableHead>
                  <TableHead className="font-semibold">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      회사 이메일
                    </span>
                  </TableHead>
                  <TableHead className="font-semibold">직책</TableHead>
                  <TableHead className="font-semibold">합류일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="transition-colors hover:bg-primary/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {member.user?.name.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium">{member.user?.name ?? '알 수 없음'}</p>
                          {member.user?.nickname ? <p className="text-xs text-muted-foreground">@{member.user.nickname}</p> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.user?.email ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.companyEmail ?? '-'}</TableCell>
                    <TableCell>
                      <Badge className={member.role === 'owner' ? 'bg-primary/10 text-primary border-0 text-xs' : 'bg-muted text-muted-foreground border-0 text-xs'}>
                        {MEMBER_ROLE_LABEL[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

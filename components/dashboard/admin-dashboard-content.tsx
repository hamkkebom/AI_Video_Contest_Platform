'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BarChart3,
  Film,
  MessageSquare,
  Newspaper,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleDistribution {
  participant: number;
  host: number;
  judge: number;
  admin: number;
}

interface AdminActivityItem {
  id: string;
  userName: string;
  userInitial: string;
  description: string;
  timestamp: string;
}

interface AdminDashboardData {
  todayLabel: string;
  totalUsers: number;
  activeUsers: number;
  totalContests: number;
  ongoingContests: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingInquiries: number;
  roleDistribution: RoleDistribution;
  recentActivities: AdminActivityItem[];
}

interface AdminDashboardContentProps {
  data: AdminDashboardData;
}

interface StatCard {
  label: string;
  value: string | number;
  trend: string;
  sub: string;
  icon: LucideIcon;
  borderClass: string;
  iconClass: string;
}

const monthlySignupData = [
  { month: '1월', count: 8 },
  { month: '2월', count: 13 },
  { month: '3월', count: 16 },
  { month: '4월', count: 14 },
  { month: '5월', count: 21 },
  { month: '6월', count: 25 },
  { month: '7월', count: 28 },
  { month: '8월', count: 31 },
];

const pieColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary-foreground))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--accent-foreground))',
];

const quickActions: Array<{
  href: Route;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    href: '/admin/users',
    title: '회원 관리',
    description: '회원 상태와 역할을 검토하고 계정을 관리합니다.',
    icon: Users,
  },
  {
    href: '/admin/inquiries',
    title: '문의 관리',
    description: '처리 대기 문의를 우선순위에 따라 대응합니다.',
    icon: MessageSquare,
  },
  {
    href: '/admin/analytics',
    title: '분석',
    description: '유입과 전환 지표를 확인해 운영 전략을 점검합니다.',
    icon: BarChart3,
  },
  {
    href: '/admin/articles',
    title: '아티클 관리',
    description: '공지와 트렌드 콘텐츠를 발행하고 편집합니다.',
    icon: Newspaper,
  },
];

export function AdminDashboardContent({ data }: AdminDashboardContentProps) {
  const roleChartData = [
    { name: '참가자', value: data.roleDistribution.participant },
    { name: '주최자', value: data.roleDistribution.host },
    { name: '심사위원', value: data.roleDistribution.judge },
    { name: '관리자', value: data.roleDistribution.admin },
  ].filter((item) => item.value > 0);

  const chartRoleData = roleChartData.length > 0 ? roleChartData : [{ name: '데이터 없음', value: 1 }];

  const stats: StatCard[] = [
    {
      label: '전체 회원',
      value: data.totalUsers,
      trend: '전월 대비 +9%',
      sub: `활성 ${data.activeUsers}명`,
      icon: Users,
      borderClass: 'border-l-primary',
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: '전체 공모전',
      value: data.totalContests,
      trend: '전월 대비 +6%',
      sub: `진행중 ${data.ongoingContests}개`,
      icon: Trophy,
      borderClass: 'border-l-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: '전체 출품작',
      value: data.totalSubmissions,
      trend: '전월 대비 +14%',
      sub: `승인 ${data.approvedSubmissions}개`,
      icon: Film,
      borderClass: 'border-l-sky-500',
      iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: '대기 문의',
      value: data.pendingInquiries,
      trend: '처리 필요',
      sub: '실시간 확인 권장',
      icon: ShieldAlert,
      borderClass: 'border-l-rose-500',
      iconClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{data.todayLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">관리자 대시보드</h1>
        <p className="text-sm text-muted-foreground">전체 운영 지표와 최근 활동을 한 화면에서 빠르게 점검하세요.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-border border-l-4 ${stat.borderClass}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconClass}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>월별 가입자 추이</CardTitle>
            <CardDescription>최근 8개월 신규 가입자 수</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySignupData} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#signupGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>회원 역할 분포</CardTitle>
            <CardDescription>역할별 회원 구성 비율</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartRoleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {chartRoleData.map((item, index) => (
                    <Cell key={`${item.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 활동 피드</CardTitle>
              <CardDescription>회원 행동 로그 기준 최신 8건</CardDescription>
            </div>
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm" className="gap-1.5">
                활동 분석 <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                최근 활동 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-0">
                {data.recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 py-4">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {activity.userInitial}
                      </div>
                      {index < data.recentActivities.length - 1 ? (
                        <span className="mt-2 h-full w-px bg-border" aria-hidden="true" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1 border-b border-border pb-4 last:border-b-0 last:pb-0">
                      <p className="text-sm font-medium leading-relaxed">
                        <span className="font-semibold text-foreground">{activity.userName}</span>{' '}
                        <span className="text-muted-foreground">{activity.description}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">빠른 관리</h2>
          <p className="text-xs text-muted-foreground">자주 사용하는 관리 화면으로 빠르게 이동합니다.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.href} href={action.href}>
                <Card className="h-full border-border transition-colors hover:border-primary/40 hover:bg-muted/40">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

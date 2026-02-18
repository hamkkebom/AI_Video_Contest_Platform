import { getActivityLogs, getContests } from "@/lib/mock";

export default async function HostReportsPage() {
  const [contests, activityLogs] = await Promise.all([getContests(), getActivityLogs()]);

  return (
    <main>
      <h1>운영 리포트</h1>
      <p>리포트 대상 공모전: {contests.length}개</p>
      <p>운영 이벤트 로그: {activityLogs.length}건</p>
    </main>
  );
}

import { getSubmissions } from "@/lib/mock";

type JudgeSubmissionPageProps = {
  params: Promise<{ contestId: string; submissionId: string }>;
};

export default async function JudgeSubmissionPage({ params }: JudgeSubmissionPageProps) {
  const { contestId, submissionId } = await params;
  const submissions = await getSubmissions({ contestId });
  const submission = submissions.find((item) => item.id === submissionId);

  return (
    <main>
      <h1>심사 화면</h1>
      <p>공모전 ID: {contestId}</p>
      <p>출품작: {submission?.title ?? "존재하지 않는 출품작"}</p>
    </main>
  );
}

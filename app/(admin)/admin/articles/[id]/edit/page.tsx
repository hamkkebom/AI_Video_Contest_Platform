import { notFound } from 'next/navigation';
import { getArticleByIdForAdmin } from '@/lib/data';
import ArticleForm from '../../_components/article-form';

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
};

/**
 * 아티클 수정
 * 미발행 초안도 열어야 하므로 관리자 전용 조회(admin_list_articles RPC)를 쓴다.
 */
export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleByIdForAdmin(id);
  if (!article) notFound();

  return <ArticleForm mode="edit" article={article} />;
}

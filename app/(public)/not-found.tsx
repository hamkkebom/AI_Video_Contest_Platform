import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * 공개 영역 공통 404
 * 예전에는 공모전·작품·스토리가 각자 "찾을 수 없습니다" 카드를 그려서
 * 디자인이 제각각인 데다 HTTP 상태가 200 이었다(소프트 404).
 * notFound() 를 호출하면 이 화면이 진짜 404 와 함께 렌더된다.
 */
export default function PublicNotFound() {
  return (
    <div className="w-full min-h-[70vh] bg-background">
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-2xl">
          <Card className="border border-border p-12 text-center">
            <div className="space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">페이지를 찾을 수 없습니다</h1>
                <p className="text-muted-foreground leading-relaxed">
                  요청하신 페이지가 존재하지 않거나 삭제되었습니다.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/contests">
                  <Button className="cursor-pointer">공모전 보기</Button>
                </Link>
                <Link href="/gallery/all">
                  <Button variant="outline" className="cursor-pointer">갤러리 둘러보기</Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="cursor-pointer">홈으로</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

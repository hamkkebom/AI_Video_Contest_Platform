import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

/**
 * 이용약관 페이지
 * CSS 변수 기반 테마, Card 섹션 구분
 */

const sections = [
  { id: 'article-1', title: '제1조 (목적)' },
  { id: 'article-2', title: '제2조 (정의)' },
  { id: 'article-3', title: '제3조 (약관의 효력 및 변경)' },
  { id: 'article-4', title: '제4조 (회원가입 및 자격)' },
  { id: 'article-5', title: '제5조 (서비스의 제공)' },
  { id: 'article-6', title: '제6조 (공모전 서비스의 성격 및 책임)' },
  { id: 'article-7', title: '제7조 (참가 작품의 권리 및 책임)' },
  { id: 'article-8', title: '제8조 (작품 활용)' },
  { id: 'article-9', title: '제9조 (공모전 취소·변경)' },
  { id: 'article-9-2', title: '제9조의2 (상금 지급)' },
  { id: 'article-10', title: '제10조 (기업회원 및 운영 대행)' },
  { id: 'article-11', title: '제11조 (유료 서비스)' },
  { id: 'article-12', title: '제12조 (이용자의 의무)' },
  { id: 'article-12-2', title: '제12조의2 (이용 제한 및 해지)' },
  { id: 'article-13', title: '제13조 (면책)' },
  { id: 'article-14', title: '제14조 (준거법 및 관할)' },
];

export default function TermsPage() {
  return (
    <div className="w-full">
      {/* 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">이용약관</h1>
              <p className="text-sm text-muted-foreground">서비스 이용에 관한 약관입니다</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">최종 수정일: 2026년 2월 23일</Badge>
        </div>
      </section>

      {/* 본문 */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex gap-8">
            {/* 목차 사이드바 (데스크톱) */}
            <nav className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">목차</p>
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                    {s.title}
                  </a>
                ))}
              </div>
            </nav>

            {/* 약관 내용 */}
            <div className="flex-1 space-y-6">
              <Card id="article-1">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제1조 (목적)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    이 약관은 함께봄(이하 &quot;회사&quot;)이 운영하는 AI 영상 공모전 플랫폼 및 관련 서비스(영상 제작 대행, 마케팅 대행, 교육 서비스, 분석 시스템(SaaS) 등, 이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-2">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제2조 (정의)</h2>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>&quot;서비스&quot;란 회사가 제공하는 공모전 플랫폼 및 관련 부가 서비스를 의미합니다.</li>
                    <li>&quot;이용자&quot;란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                    <li>&quot;회원&quot;이란 서비스에 개인정보를 제공하여 회원등록을 완료한 자를 말하며, 개인회원과 기업회원을 포함합니다.</li>
                    <li>&quot;기업회원&quot;이란 사업자등록을 완료하고 기업 명의로 가입한 회원을 말합니다.</li>
                    <li>&quot;공모전&quot;이란 회사 또는 외부 주최 기업이 서비스를 통해 개최하는 AI 영상 공모전을 의미합니다.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="article-3">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 이 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 사전 공지합니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-4">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제4조 (회원가입 및 자격)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 회원가입은 이용자가 약관 및 개인정보처리방침에 동의하고 회사가 이를 승인함으로써 성립합니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 기업회원의 경우 회사는 사업자등록증 등 추가 자료 제출을 요청할 수 있습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 허위 정보 등록 시 회사는 회원 자격을 제한하거나 해지할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-5">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제5조 (서비스의 제공)</h2>
                  <p className="text-muted-foreground leading-relaxed">회사는 다음 서비스를 제공합니다.</p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-2">
                    <li>AI 영상 공모전 개최 및 참가 서비스</li>
                    <li>수상작 갤러리 서비스</li>
                    <li>AI 영상 제작 교육 서비스</li>
                    <li>영상 제작 및 마케팅 대행 서비스</li>
                    <li>분석 시스템(SaaS) 제공 서비스</li>
                    <li>기타 회사가 정하는 서비스</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="article-6">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제6조 (공모전 서비스의 성격 및 책임)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 회사는 공모전 운영을 위한 플랫폼을 제공하는 중개적 지위에 있습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 공모전의 기획, 심사 기준, 수상자 선정 및 상금 지급 조건은 개별 주최 기업의 책임 하에 결정됩니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 회사는 심사 결과, 수상 여부, 평가 기준 등에 대하여 직접적인 책임을 부담하지 않습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-7">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제7조 (참가 작품의 권리 및 책임)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 참가자는 제출 작품이 제3자의 권리를 침해하지 않음을 보증합니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 표절, 도용, 저작권 침해 등으로 발생하는 법적 책임은 참가자에게 있습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 회사는 권리 침해가 의심되는 경우 해당 콘텐츠를 삭제 또는 제한할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-8">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제8조 (작품 활용)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 참가자는 공모전 운영, 홍보 및 서비스 소개를 위하여 제출 작품을 회사 및 주최 기업이 온라인·오프라인 매체에서 활용하는 것에 동의합니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 수상작의 상업적 활용 여부 및 범위는 개별 공모전 요강 또는 별도 계약에 따릅니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-9">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제9조 (공모전 취소·변경)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    주최 기업의 사정 또는 불가항력적 사유로 공모전 일정이 변경 또는 취소될 수 있으며, 회사는 이에 대한 직접적인 책임을 부담하지 않습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-9-2">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제9조의2 (상금 지급)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 상금 지급 조건 및 일정은 개별 공모전 요강에 따릅니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 수상자가 제출 정보 누락 또는 허위 정보를 제공한 경우 상금 지급이 제한될 수 있습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 상금 지급 시 관련 세법에 따라 제세공과금이 공제될 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-10">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제10조 (기업회원 및 운영 대행)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 기업회원이 요청하는 공모전 운영 대행 및 영상·마케팅 대행 서비스는 별도의 계약 또는 견적 조건에 따릅니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 계약 범위, 비용, 일정, 결과물 권리 귀속은 개별 계약에 따릅니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 기업회원의 요청에 따른 콘텐츠, 자료, 기획 내용으로 발생하는 법적 책임은 해당 기업회원에게 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-11">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제11조 (유료 서비스)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 회사는 일부 서비스를 유료로 제공할 수 있습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 요금, 결제 방법, 이용 기간 및 환불 기준 등은 서비스 화면 또는 별도 안내에 따릅니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 결제는 전자결제대행사를 통해 이루어집니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-12">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제12조 (이용자의 의무)</h2>
                  <p className="text-muted-foreground leading-relaxed">이용자는 다음 사항을 준수하여야 합니다.</p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-2">
                    <li>관계 법령 및 약관 준수</li>
                    <li>타인의 권리 침해 금지</li>
                    <li>허위 정보 등록 금지</li>
                    <li>서비스 운영 방해 행위 금지</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="article-12-2">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제12조의2 (이용 제한 및 해지)</h2>
                  <p className="text-muted-foreground leading-relaxed">회사는 다음의 경우 사전 통지 후 회원의 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-2">
                    <li>약관 위반</li>
                    <li>허위 정보 등록</li>
                    <li>타인의 권리 침해</li>
                    <li>서비스 운영을 방해하는 행위</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="article-13">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제13조 (면책)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ① 회사는 천재지변, 서버 장애, 통신 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ② 회사는 이용자 간 분쟁에 개입하지 않습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ③ 회사는 공모전 심사 결과 및 주최 기업의 의사결정에 대한 책임을 부담하지 않습니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    ④ 이용자의 약관 위반 또는 불법 행위로 회사에 손해가 발생한 경우 해당 이용자는 회사에 그 손해를 배상하여야 합니다.
                  </p>
                </CardContent>
              </Card>

              <Card id="article-14">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">제14조 (준거법 및 관할)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    본 약관은 대한민국 법령에 따르며, 분쟁 발생 시 회사 본점 소재지 관할 법원을 전속 관할로 합니다.
                  </p>
                </CardContent>
              </Card>

              <div className="border-t border-border pt-6 mt-6">
                <p className="text-sm text-muted-foreground">본 약관은 2026년 2월 23일부터 시행됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

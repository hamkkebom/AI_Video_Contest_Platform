import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

/**
 * 개인정보처리방침 페이지
 * CSS 변수 기반 테마, Card 섹션 구분
 */

const sections = [
  { id: 'privacy-1', title: '1. 수집 및 이용 목적' },
  { id: 'privacy-2', title: '2. 수집 항목' },
  { id: 'privacy-3', title: '3. 보유 및 이용 기간' },
  { id: 'privacy-4', title: '4. 제3자 제공' },
  { id: 'privacy-5', title: '5. 처리 위탁' },
  { id: 'privacy-6', title: '6. 이용자 권리' },
  { id: 'privacy-7', title: '7. 파기 절차 및 방법' },
  { id: 'privacy-8', title: '8. 기술적·관리적 조치' },
  { id: 'privacy-9', title: '9. 쿠키 사용' },
  { id: 'privacy-10', title: '10. 보호 책임자' },
];

export default function PrivacyPage() {
  return (
    <div className="w-full">
      {/* 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">개인정보처리방침</h1>
              <p className="text-sm text-muted-foreground">개인정보 수집 및 이용에 관한 안내입니다</p>
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

            {/* 방침 내용 */}
            <div className="flex-1 space-y-6">
              <Card id="privacy-1">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">1. 개인정보의 수집 및 이용 목적</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 다음 목적을 위하여 개인정보를 처리함.
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                    <li>회원 식별 및 관리</li>
                    <li>공모전 운영 및 참가 관리</li>
                    <li>기업 대상 공모전 운영 대행</li>
                    <li>기업회원 자격 확인 및 사업자 인증</li>
                    <li>영상 제작 및 마케팅 대행 서비스 제공</li>
                    <li>분석 시스템(SaaS) 및 구독 서비스 제공</li>
                    <li>계약 체결 및 이행 관리</li>
                    <li>결제 및 정산 처리</li>
                    <li>세금계산서 발행 및 세무 처리</li>
                    <li>교육 및 프로그램 운영</li>
                    <li>서비스 개선 및 통계 분석</li>
                    <li>마케팅 및 홍보</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="privacy-2">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">2. 수집하는 개인정보 항목</h2>

                  <h3 className="text-sm font-semibold mt-4 mb-2">① 공통 수집 항목 (회원가입 및 서비스 이용 시)</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>이름</li>
                    <li>이메일</li>
                    <li>휴대전화번호</li>
                    <li>비밀번호</li>
                    <li>IP 주소</li>
                    <li>접속 기록</li>
                    <li>기기 정보</li>
                    <li>서비스 이용 기록</li>
                  </ul>

                  <h3 className="text-sm font-semibold mt-6 mb-2">② 공모전 참가 시 추가 수집 항목</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>소속(학교/기업 등)</li>
                    <li>생년월일(필요 시)</li>
                    <li>제출 작품 및 작품 설명</li>
                    <li>수상 시 상금 지급을 위한 계좌정보(해당자에 한함)</li>
                  </ul>

                  <h3 className="text-sm font-semibold mt-6 mb-2">③ 기업회원 가입 및 운영 대행 문의 시</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>회사명</li>
                    <li>사업자등록번호</li>
                    <li>사업자등록증 사본</li>
                    <li>대표자 성명</li>
                    <li>담당자 이름</li>
                    <li>직함</li>
                    <li>연락처</li>
                    <li>이메일</li>
                    <li>세금계산서 발행 정보</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">
                    ※ 사업자등록증은 기업회원 자격 확인 및 계약·정산 목적에 한하여 이용함.
                  </p>

                  <h3 className="text-sm font-semibold mt-6 mb-2">④ 영상 제작 및 마케팅 대행 계약 시</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>계약 담당자 정보</li>
                    <li>계약 관련 서류 정보</li>
                    <li>세금계산서 발행 정보</li>
                    <li>정산 계좌 정보</li>
                  </ul>

                  <h3 className="text-sm font-semibold mt-6 mb-2">⑤ 유료 서비스 및 구독형 서비스 이용 시</h3>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>결제수단 정보</li>
                    <li>승인 내역 정보</li>
                    <li>환불 계좌 정보(필요 시)</li>
                    <li>결제 관련 기록: 5년</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="privacy-3">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">3. 보유 및 이용 기간</h2>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                    <li>회원 탈퇴 시 즉시 파기</li>
                    <li>계약 관련 기록: 5년</li>
                    <li>결제 및 대금 정산 기록: 5년</li>
                    <li>소비자 분쟁 처리 기록: 3년</li>
                    <li>접속 기록: 3개월</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관함.
                  </p>
                </CardContent>
              </Card>

              <Card id="privacy-4">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않음.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    다만, 다음의 경우에는 예외로 함:
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                    <li>이용자가 사전에 동의한 경우</li>
                    <li>법령에 따라 제공 의무가 있는 경우</li>
                    <li>결제 처리를 위하여 결제대행사에 필요한 정보 제공하는 경우</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="privacy-5">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">5. 개인정보 처리의 위탁</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리를 외부에 위탁할 수 있음.
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                    <li>결제 처리: 전자결제대행사(PG사)</li>
                    <li>서버 운영 및 클라우드 서비스 제공업체</li>
                    <li>문자 및 이메일 발송 서비스 업체</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    위탁 시 관련 법령에 따라 계약을 통해 개인정보 보호가 안전하게 이루어지도록 관리·감독함.
                  </p>
                </CardContent>
              </Card>

              <Card id="privacy-6">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">6. 이용자의 권리 및 행사 방법</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    이용자는 언제든지 다음 권리를 행사할 수 있음.
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                    <li>개인정보 열람 요청</li>
                    <li>정정 요청</li>
                    <li>삭제 요청</li>
                    <li>처리 정지 요청</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    요청은 이메일 또는 고객센터를 통해 가능하며, 회사는 지체 없이 조치함.
                  </p>
                </CardContent>
              </Card>

              <Card id="privacy-7">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">7. 개인정보의 파기 절차 및 방법</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 정보를 파기함.
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                    <li>전자적 파일 형태: 복구 불가능한 방법으로 삭제</li>
                    <li>종이 문서: 분쇄 또는 소각</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="privacy-8">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">8. 개인정보 보호를 위한 기술적·관리적 조치</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 개인정보 보호를 위해 다음과 같은 조치를 취함.
                  </p>
                  <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                    <li>접근 권한 최소화</li>
                    <li>개인정보 암호화</li>
                    <li>보안 프로그램 설치</li>
                    <li>접속 기록 관리</li>
                    <li>내부 관리계획 수립 및 시행</li>
                  </ul>
                </CardContent>
              </Card>

              <Card id="privacy-9">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">9. 쿠키의 사용</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용할 수 있음.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있음.
                  </p>
                </CardContent>
              </Card>

              <Card id="privacy-10">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">10. 개인정보 보호책임자</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고,
                    개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제를 위하여
                    아래와 같이 개인정보 보호책임자를 지정함.
                  </p>
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">개인정보 보호책임자</p>
                    <p className="text-sm font-medium">이메일: hamkkebom12@gmail.com</p>
                  </div>
                </CardContent>
              </Card>

              <div className="border-t border-border pt-6 mt-6">
                <p className="text-sm text-muted-foreground">본 개인정보처리방침은 2026년 2월 23일부터 시행됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="w-full">
      <section className="py-12 px-4 bg-muted/30 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">이용약관</h1>
          <p className="text-muted-foreground mt-2">최종 수정일: 2025년 1월 1일</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl prose prose-neutral max-w-none">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-4">제1조 (목적)</h2>
              <p className="text-muted-foreground leading-relaxed">
                이 약관은 함께봄(이하 &quot;회사&quot;)이 운영하는 AI 영상 공모전 플랫폼(이하 &quot;서비스&quot;)의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">제2조 (정의)</h2>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                <li>&quot;서비스&quot;란 회사가 제공하는 AI 영상 공모전 플랫폼 관련 모든 서비스를 의미합니다.</li>
                <li>&quot;이용자&quot;란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>&quot;회원&quot;이란 서비스에 개인정보를 제공하여 회원등록을 한 자를 말합니다.</li>
                <li>&quot;공모전&quot;이란 회사 또는 주최자가 서비스를 통해 개최하는 AI 영상 공모전을 의미합니다.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">제3조 (약관의 효력 및 변경)</h2>
              <p className="text-muted-foreground leading-relaxed">
                ① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                ② 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">제4조 (서비스의 제공)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 다음과 같은 서비스를 제공합니다.
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-2">
                <li>AI 영상 공모전 개최 및 참가 서비스</li>
                <li>수상작 갤러리 서비스</li>
                <li>AI 영상 제작 교육 서비스</li>
                <li>AI 영상 제작 대행 서비스</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">제5조 (이용자의 의무)</h2>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                <li>이용자는 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.</li>
                <li>이용자는 타인의 지적재산권을 침해하는 콘텐츠를 등록하여서는 안 됩니다.</li>
                <li>이용자는 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 배포, 방송하여서는 안 됩니다.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">제6조 (면책조항)</h2>
              <p className="text-muted-foreground leading-relaxed">
                ① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우에는
                서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                ② 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.
              </p>
            </div>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                본 약관은 2025년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

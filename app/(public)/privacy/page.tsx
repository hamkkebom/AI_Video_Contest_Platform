export default function PrivacyPage() {
  return (
    <div className="w-full">
      <section className="py-12 px-4 bg-muted/30 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">개인정보처리방침</h1>
          <p className="text-muted-foreground mt-2">최종 수정일: 2025년 1월 1일</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl prose prose-neutral max-w-none">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
              <p className="text-muted-foreground leading-relaxed">
                함께봄(이하 &quot;회사&quot;)은 다음의 목적을 위하여 개인정보를 처리합니다.
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 가입의사 확인</li>
                <li>서비스 제공: 공모전 참가, 수상작 관리, 교육 서비스 제공</li>
                <li>마케팅 및 광고: 이벤트 및 광고성 정보 제공, 서비스 이용 통계</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">2. 수집하는 개인정보 항목</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                <li>필수항목: 이메일, 이름, 비밀번호</li>
                <li>선택항목: 닉네임, 프로필 사진, 기업명, 지역</li>
                <li>서비스 이용 중 자동 수집: IP 주소, 접속 기기 정보, 접속 일시, 서비스 이용 기록</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에
                동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                <li>회원 탈퇴 시: 즉시 파기 (단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 제외)</li>
                <li>계약 또는 청약철회 관련 기록: 5년</li>
                <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
                <li>접속 기록: 3개월</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                다만, 아래의 경우에는 예외로 합니다.
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">5. 개인정보의 파기 절차 및 방법</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
                지체없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5 mt-3">
                <li>전자적 파일: 복구 및 재생이 불가능하도록 기술적 방법을 사용하여 안전하게 삭제</li>
                <li>인쇄물: 분쇄기로 분쇄하거나 소각하여 파기</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">6. 개인정보 보호 책임자</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
                아래와 같이 개인정보 보호 책임자를 지정하고 있습니다.
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">개인정보 보호 책임자</p>
                <p className="text-sm font-medium mt-1">이메일: privacy@hamkkebom.kr</p>
                <p className="text-sm font-medium">전화: 02-0000-0000</p>
              </div>
            </div>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ColorAPage() {
  const PRIMARY = "#0066FF";
  const SECONDARY = "#00D9FF";
  const ACCENT = "#FF6B00";

  const contests = [
    { title: "AI 영상 제작 콘테스트 2025", participants: 342, deadline: "3일" },
    { title: "음악 MV AI 생성 공모전", participants: 256, deadline: "5일" },
    { title: "상업 광고 AI 제작 대회", participants: 198, deadline: "7일" },
  ];

  return (
    <main style={{ padding: "40px 20px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
          color: "#fff",
          padding: "60px 40px",
          borderRadius: 12,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 32, margin: "0 0 16px", fontWeight: 700 }}>
          AI 영상 공모전 플랫폼
        </h1>
        <p style={{ fontSize: 16, margin: "0 0 24px", opacity: 0.95 }}>
          <strong>Color Scheme A: Modern Blue Tech</strong>
        </p>
        <p style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>
          이 색상 조합을 선호하시나요?
        </p>
        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            opacity: 0.85,
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          <div>Primary: {PRIMARY} | Secondary: {SECONDARY} | Accent: {ACCENT}</div>
        </div>
      </section>

      {/* Contest Cards Section */}
      <section style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
          공모전 카드 샘플
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {contests.map((contest, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: `2px solid ${PRIMARY}`,
              }}
            >
              {/* Image placeholder */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {contest.title}
              </div>

              {/* Card content */}
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 8px", color: PRIMARY, fontSize: 16, fontWeight: 700 }}>
                  {contest.title}
                </h3>
                <p style={{ margin: "0 0 12px", color: "#666", fontSize: 14 }}>
                  AI를 활용한 창작 콘텐츠를 공모합니다.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    color: "#999",
                    fontSize: 13,
                  }}
                >
                  <span>🎬 {contest.participants}명 참가</span>
                  <span style={{ color: ACCENT }}>•</span>
                  <span>⏰ {contest.deadline} 남음</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section
        style={{
          marginTop: 60,
          padding: "40px",
          background: "#fff",
          borderRadius: 12,
          textAlign: "center",
          border: `2px solid ${PRIMARY}`,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px", color: "#1a1a1a" }}>
          이 색상이 마음에 드셨나요?
        </h2>
        <p style={{ color: "#666", marginBottom: 24, fontSize: 16 }}>
          선택된 색상을 기반으로 전체 테마와 디자인 시스템을 구축하겠습니다.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "12px 32px",
              background: PRIMARY,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            이 색상 선택 ✓
          </button>
          <a
            href="/color-b"
            style={{
              padding: "12px 32px",
              background: "#fff",
              color: PRIMARY,
              border: `2px solid ${PRIMARY}`,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            다른 색상 보기 →
          </a>
        </div>
      </section>

      {/* Color Info */}
      <section
        style={{
          marginTop: 60,
          padding: "40px",
          background: "#fff",
          borderRadius: 12,
          maxWidth: 600,
          margin: "60px auto 0",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>
          Color Scheme A 특징
        </h3>
        <ul style={{ color: "#666", lineHeight: 1.8, fontSize: 14 }}>
          <li>🔵 Primary Color: 현대적이고 기술적인 느낌의 비브란트 블루</li>
          <li>🟦 Secondary Color: 밝고 상큼한 사이언 색상으로 신선함 전달</li>
          <li>🟠 Accent Color: 따뜻한 오렌지로 포인트와 CTA에 사용</li>
          <li>✨ 분위기: 첨단 기술, AI, 혁신 플랫폼의 이미지</li>
        </ul>
      </section>
    </main>
  );
}

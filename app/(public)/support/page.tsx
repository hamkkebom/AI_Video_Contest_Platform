'use client';

import { useState, useEffect } from 'react';
import { getFaqs } from '@/lib/mock';
import type { FAQ } from '@/lib/types';
import { FAQ_CATEGORIES } from '@/config/constants';

/**
 * 지원 허브 페이지
 * FAQ 아코디언, 문의 양식, 대행 의뢰 양식
 */
export default function SupportPage() {
  const PRIMARY = '#EA580C';
  const SECONDARY = '#F59E0B';
  const ACCENT = '#8B5CF6';

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [inquiryForm, setInquiryForm] = useState({
    email: '',
    subject: '',
    message: '',
  });

  const [commissionForm, setCommissionForm] = useState({
    company: '',
    contact: '',
    message: '',
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'inquiry' | 'commission' | null;
    success: boolean;
  }>({ type: null, success: false });

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await getFaqs();
        setFaqs(data);
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const filteredFaqs = selectedFaqCategory
    ? faqs.filter((faq) => faq.category === selectedFaqCategory)
    : faqs;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo submission - no persistence
    console.log('Inquiry submitted:', inquiryForm);
    setSubmitStatus({ type: 'inquiry', success: true });
    setInquiryForm({ email: '', subject: '', message: '' });
    setTimeout(() => setSubmitStatus({ type: null, success: false }), 3000);
  };

  const handleCommissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo submission - no persistence
    console.log('Commission submitted:', commissionForm);
    setSubmitStatus({ type: 'commission', success: true });
    setCommissionForm({ company: '', contact: '', message: '' });
    setTimeout(() => setSubmitStatus({ type: null, success: false }), 3000);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
          color: '#fff',
          padding: '60px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '40px', margin: '0 0 16px', fontWeight: 700 }}>
            지원 센터
          </h1>
          <p style={{ fontSize: '18px', margin: 0, opacity: 0.95 }}>
            자주 묻는 질문, 문의, 대행 의뢰를 한 곳에서 처리하세요
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 40px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px', color: '#1a1a1a' }}>
            자주 묻는 질문 (FAQ)
          </h2>

          {/* Category Filter */}
          <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedFaqCategory(null)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: selectedFaqCategory === null ? PRIMARY : '#f0f0f0',
                color: selectedFaqCategory === null ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              전체
            </button>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedFaqCategory(category.value)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedFaqCategory === category.value ? PRIMARY : '#f0f0f0',
                  color: selectedFaqCategory === category.value ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              로딩 중...
            </div>
          ) : (
            <div style={{ maxWidth: '800px' }}>
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  style={{
                    marginBottom: '12px',
                    border: `1px solid #e5e5e5`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() =>
                      setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)
                    }
                    style={{
                      width: '100%',
                      padding: '20px',
                      background: expandedFaqId === faq.id ? `${PRIMARY}15` : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (expandedFaqId !== faq.id) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedFaqId !== faq.id) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                      }
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        textAlign: 'left',
                      }}
                    >
                      {faq.question}
                    </span>
                    <span
                      style={{
                        color: PRIMARY,
                        fontSize: '20px',
                        marginLeft: '16px',
                        flexShrink: 0,
                        transition: 'transform 0.2s',
                        transform:
                          expandedFaqId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {expandedFaqId === faq.id && (
                    <div
                      style={{
                        padding: '20px',
                        background: '#f9f9f9',
                        borderTop: `1px solid #e5e5e5`,
                        color: '#666',
                        lineHeight: 1.6,
                        fontSize: '15px',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Forms Section */}
      <section style={{ padding: '60px 40px', background: '#f9f9f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '40px',
            }}
          >
            {/* Inquiry Form */}
            <div>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '24px',
                  color: '#1a1a1a',
                }}
              >
                일반 문의
              </h3>
              <form onSubmit={handleInquirySubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    이메일
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, email: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid #ddd`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    제목
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.subject}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, subject: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid #ddd`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="문의 제목을 입력하세요"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    메시지
                  </label>
                  <textarea
                    required
                    value={inquiryForm.message}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, message: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid #ddd`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                    placeholder="문의 내용을 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: PRIMARY,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#d94a08';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = PRIMARY;
                  }}
                >
                  문의 제출
                </button>

                {submitStatus.type === 'inquiry' && submitStatus.success && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#d4edda',
                      color: '#155724',
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    ✓ 문의가 제출되었습니다. 곧 연락드리겠습니다.
                  </div>
                )}
              </form>
            </div>

            {/* Commission Form */}
            <div>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '24px',
                  color: '#1a1a1a',
                }}
              >
                대행 의뢰
              </h3>
              <form onSubmit={handleCommissionSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    회사명
                  </label>
                  <input
                    type="text"
                    required
                    value={commissionForm.company}
                    onChange={(e) =>
                      setCommissionForm({ ...commissionForm, company: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid #ddd`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="회사명을 입력하세요"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    담당자 연락처
                  </label>
                  <input
                    type="text"
                    required
                    value={commissionForm.contact}
                    onChange={(e) =>
                      setCommissionForm({ ...commissionForm, contact: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid #ddd`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="이메일 또는 전화번호"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    의뢰 내용
                  </label>
                  <textarea
                    required
                    value={commissionForm.message}
                    onChange={(e) =>
                      setCommissionForm({ ...commissionForm, message: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid #ddd`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                    placeholder="의뢰 내용을 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: ACCENT,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#7C4DCC';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = ACCENT;
                  }}
                >
                  의뢰 제출
                </button>

                {submitStatus.type === 'commission' && submitStatus.success && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#d4edda',
                      color: '#155724',
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    ✓ 의뢰가 제출되었습니다. 곧 연락드리겠습니다.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

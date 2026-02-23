'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { FAQ_CATEGORIES, FAQ_TOPICS } from '@/config/constants';
import type { FAQ, FaqCategory, FaqTopic } from '@/lib/types';

/**
 * FAQ 전용 페이지
 * 역할별(참가자/주최자/심사위원/일반) + 주제별(공모전/서비스/결제/기술/계정) 이중 필터링
 * 다중역할 사용자는 역할 탭으로 전환 가능
 */
export default function FaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  /* 역할 필터 (null = 전체) */
  const [selectedRole, setSelectedRole] = useState<FaqCategory | null>(null);
  /* 주제 필터 (null = 전체) */
  const [selectedTopic, setSelectedTopic] = useState<FaqTopic | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/faqs'); const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* 이중 필터링: 역할 + 주제 */
  const filteredFaqs = useMemo(() => {
    let result = faqs;

    if (selectedRole) {
      /* "일반"은 모든 역할에 해당하므로 general도 함께 표시 */
      result = result.filter(
        (faq) => faq.category === selectedRole || faq.category === 'general'
      );
    }

    if (selectedTopic) {
      result = result.filter((faq) => faq.topic === selectedTopic);
    }

    return result;
  }, [faqs, selectedRole, selectedTopic]);

  /* 현재 필터에서 사용 가능한 주제 목록 (역할 필터 적용 후) */
  const availableTopics = useMemo(() => {
    const roleFiltered = selectedRole
      ? faqs.filter((faq) => faq.category === selectedRole || faq.category === 'general')
      : faqs;
    const topicSet = new Set(roleFiltered.map((faq) => faq.topic));
    return FAQ_TOPICS.filter((t) => topicSet.has(t.value));
  }, [faqs, selectedRole]);

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            {/* 브레드크럼 */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
              <Link href="/support" className="hover:text-foreground transition-colors">
                고객센터
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">FAQ</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              FAQ
            </h1>
            <p className="text-lg text-muted-foreground">
              자주 묻는 질문을 역할별, 주제별로 확인하세요
            </p>
          </div>
        </div>
      </section>

      {/* 역할 필터 (Glassmorphism Sticky) */}
      <section className="sticky top-16 z-40 px-4 pb-4">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 inline-flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => { setSelectedRole(null); setSelectedTopic(null); }}
              className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${
                selectedRole === null
                  ? 'text-violet-500 font-bold'
                  : 'text-muted-foreground font-medium hover:text-foreground'
              }`}
            >
              전체
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => { setSelectedRole(cat.value); setSelectedTopic(null); }}
                className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${
                  selectedRole === cat.value
                    ? 'text-violet-500 font-bold'
                    : 'text-muted-foreground font-medium hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 주제별 서브필터 */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 inline-flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedTopic(null)}
              className={`px-4 py-2 rounded-lg text-sm tracking-tight transition-all cursor-pointer ${
                selectedTopic === null
                  ? 'text-orange-500 font-bold'
                  : 'text-muted-foreground font-medium hover:text-foreground'
              }`}
            >
              전체 주제
            </button>
            {availableTopics.map((topic) => (
              <button
                type="button"
                key={topic.value}
                onClick={() => setSelectedTopic(topic.value)}
                className={`px-4 py-2 rounded-lg text-sm tracking-tight transition-all cursor-pointer ${
                  selectedTopic === topic.value
                    ? 'text-orange-500 font-bold'
                    : 'text-muted-foreground font-medium hover:text-foreground'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ 목록 */}
      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* FAQ 건수 */}
          <div className="max-w-4xl mx-auto mb-5">
            <p className="text-base text-muted-foreground">
              총 <span className="text-[#EA580C] font-semibold">{filteredFaqs.length}</span>개의 FAQ
              {selectedRole && (
                <span className="ml-2 text-sm">
                  · {FAQ_CATEGORIES.find((c) => c.value === selectedRole)?.label}
                  {selectedRole !== 'general' && ' + 일반'}
                </span>
              )}
            </p>
          </div>

          {/* FAQ 아코디언 */}
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">로딩 중...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-5">
                <span className="text-3xl">?</span>
              </div>
              <h3 className="text-lg font-bold mb-2">해당 조건의 FAQ가 없습니다</h3>
              <p className="text-muted-foreground text-sm">다른 역할이나 주제를 선택해 보세요.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-3">
              {filteredFaqs.map((faq) => {
                /* 역할/주제 뱃지 색상 */
                const roleBadgeClass =
                  faq.category === 'general'
                    ? 'bg-gray-500/10 text-gray-500'
                    : faq.category === 'participant'
                      ? 'bg-blue-500/10 text-blue-500'
                      : faq.category === 'host'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-purple-500/10 text-purple-500';

                const roleLabel = FAQ_CATEGORIES.find((c) => c.value === faq.category)?.label ?? '';
                const topicLabel = FAQ_TOPICS.find((t) => t.value === faq.topic)?.label ?? '';

                return (
                  <div key={faq.id} className="overflow-hidden rounded-xl backdrop-blur border border-white/10 bg-background/50">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                      className={`flex w-full items-center justify-between px-5 py-5 text-left transition-colors cursor-pointer ${
                        expandedFaqId === faq.id
                          ? 'bg-orange-500/10'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 pr-4">
                        {/* 역할 뱃지 */}
                        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeClass}`}>
                          {roleLabel}
                        </span>
                        {/* 주제 뱃지 */}
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {topicLabel}
                        </span>
                        <span className="text-base font-semibold text-foreground">
                          {faq.question}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 text-sm text-orange-400 transition-transform duration-200 ${
                          expandedFaqId === faq.id ? 'rotate-180' : 'rotate-0'
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {expandedFaqId === faq.id && (
                      <div className="border-t border-white/10 bg-muted/20 px-5 py-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

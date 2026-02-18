"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * UTM 링크 자동 생성 페이지 (클라이언트 컴포넌트)
 * 캠페인명, 매체, 소스, 콘텐츠를 입력하면
 * UTM 파라미터가 포함된 URL을 자동으로 생성합니다.
 */
export default function AdminAnalyticsUtmPage() {
  const [baseUrl, setBaseUrl] = useState("https://ai-video-contest.kr");
  const [campaign, setCampaign] = useState("");
  const [medium, setMedium] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedUrl = (() => {
    const params = new URLSearchParams();
    if (source) params.set("utm_source", source);
    if (medium) params.set("utm_medium", medium);
    if (campaign) params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  })();

  const hasParams = campaign || medium || source || content;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op in demo
    }
  };

  const presets = [
    {
      label: "네이버 블로그",
      source: "naver",
      medium: "blog",
      campaign: "ai_contest_2026",
      content: "blog_post",
    },
    {
      label: "인스타그램 광고",
      source: "instagram",
      medium: "paid_social",
      campaign: "ai_contest_2026",
      content: "feed_ad",
    },
    {
      label: "구글 검색광고",
      source: "google",
      medium: "cpc",
      campaign: "ai_contest_2026",
      content: "search_ad",
    },
    {
      label: "카카오톡 채널",
      source: "kakao",
      medium: "channel",
      campaign: "ai_contest_2026",
      content: "message",
    },
  ];

  const applyPreset = (preset: (typeof presets)[number]) => {
    setSource(preset.source);
    setMedium(preset.medium);
    setCampaign(preset.campaign);
    setContent(preset.content);
  };

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/30">
                  분석
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">UTM 링크 생성</h1>
              <p className="text-muted-foreground">
                캠페인 추적을 위한 UTM 파라미터 링크를 생성합니다
              </p>
            </div>
            <Link href="/admin/analytics">
              <Button
                variant="outline"
                className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
              >
                ← 분석 홈
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 프리셋 */}
      <section className="py-6 px-4 bg-background border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <p className="text-sm text-muted-foreground mb-3">빠른 프리셋</p>
          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="hover:border-[#EA580C] hover:text-[#EA580C]"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 입력 폼 */}
      <section className="py-8 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 입력 필드 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">파라미터 입력</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    기본 URL
                  </label>
                  <Input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="focus-visible:ring-[#EA580C]/30 focus-visible:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    캠페인명{" "}
                    <span className="text-xs text-muted-foreground">
                      (utm_campaign)
                    </span>
                  </label>
                  <Input
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    placeholder="예: ai_contest_2026"
                    className="focus-visible:ring-[#EA580C]/30 focus-visible:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    매체{" "}
                    <span className="text-xs text-muted-foreground">
                      (utm_medium)
                    </span>
                  </label>
                  <Input
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="예: cpc, email, social, blog"
                    className="focus-visible:ring-[#EA580C]/30 focus-visible:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    소스{" "}
                    <span className="text-xs text-muted-foreground">
                      (utm_source)
                    </span>
                  </label>
                  <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="예: google, naver, instagram"
                    className="focus-visible:ring-[#EA580C]/30 focus-visible:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    콘텐츠{" "}
                    <span className="text-xs text-muted-foreground">
                      (utm_content)
                    </span>
                  </label>
                  <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="예: banner_top, text_link"
                    className="focus-visible:ring-[#EA580C]/30 focus-visible:border-[#EA580C]"
                  />
                </div>
              </div>
            </div>

            {/* 우측: 생성 결과 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">생성된 URL</h2>

              <Card className="p-6 border border-border bg-muted/30">
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border border-border break-all font-mono text-sm">
                    {hasParams ? (
                      <span>
                        <span className="text-muted-foreground">{baseUrl}</span>
                        <span className="text-[#EA580C]">
                          ?
                          {[
                            source && `utm_source=${source}`,
                            medium && `utm_medium=${medium}`,
                            campaign && `utm_campaign=${campaign}`,
                            content && `utm_content=${content}`,
                          ]
                            .filter(Boolean)
                            .join("&")}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        파라미터를 입력하면 여기에 URL이 생성됩니다
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCopy}
                      disabled={!hasParams}
                      className="bg-[#EA580C] hover:bg-[#C2540A] text-white flex-1"
                    >
                      {copied ? "복사됨!" : "URL 복사"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCampaign("");
                        setMedium("");
                        setSource("");
                        setContent("");
                      }}
                      className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                    >
                      초기화
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 파라미터 미리보기 */}
              {hasParams && (
                <Card className="p-6 border border-border">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                    파라미터 요약
                  </h3>
                  <div className="space-y-2">
                    {source && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">소스</span>
                        <Badge
                          variant="outline"
                          className="border-[#EA580C]/30 text-[#EA580C]"
                        >
                          {source}
                        </Badge>
                      </div>
                    )}
                    {medium && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">매체</span>
                        <Badge
                          variant="outline"
                          className="border-[#F59E0B]/30 text-[#F59E0B]"
                        >
                          {medium}
                        </Badge>
                      </div>
                    )}
                    {campaign && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">캠페인</span>
                        <Badge
                          variant="outline"
                          className="border-[#8B5CF6]/30 text-[#8B5CF6]"
                        >
                          {campaign}
                        </Badge>
                      </div>
                    )}
                    {content && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">콘텐츠</span>
                        <Badge
                          variant="outline"
                          className="border-green-500/30 text-green-600"
                        >
                          {content}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

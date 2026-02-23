'use client';

import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';
import { Upload, FileVideo, Send, ChevronDown, ImageIcon } from 'lucide-react';

/** 접수 양식 타입 */
interface FormData {
  name: string;
  email: string;
  phone: string;
  videoTitle: string;
  description: string;
  aiTools: string;
  snsUrl1: string;
  snsUrl2: string;
  snsUrl3: string;
  agree: boolean;
}

/** 가산점 아코디언 항목 */
const bonusItems = [
  { id: 1, label: '가산점 1: 공모전 공식포스터 공유 인증' },
  { id: 2, label: '가산점 2: 헐버트박사 기념사업회 링크 공유 인증' },
  { id: 3, label: '가산점 3: 헐버트 아리랑 전시회 인증' },
];

/** 공모전 접수 섹션 */
export function ApplySection() {
  const router = useRouter();
  /* react-hook-form 대신 useState로 폼 관리 */
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    videoTitle: '',
    description: '',
    aiTools: '',
    snsUrl1: '',
    snsUrl2: '',
    snsUrl3: '',
    agree: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [snsImages, setSnsImages] = useState<(File | null)[]>([null, null, null]);
  const [openBonuses, setOpenBonuses] = useState<number[]>([]);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const snsImageRef0 = useRef<HTMLInputElement>(null);
  const snsImageRef1 = useRef<HTMLInputElement>(null);
  const snsImageRef2 = useRef<HTMLInputElement>(null);
  const snsImageRefs = [snsImageRef0, snsImageRef1, snsImageRef2];

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const toggleBonus = (id: number) => {
    setOpenBonuses((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleSnsImage = (index: number, file: File | null) => {
    setSnsImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const handleThumbnail = (file: File | null) => {
    setThumbnailFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleThumbnail(file);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'video/mp4') setVideoFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof FormData)[] = ['name', 'email', 'phone', 'videoTitle', 'description'];
    const newErrors: Partial<Record<keyof FormData, boolean>> = {};
    for (const field of requiredFields) {
      if (!form[field]) newErrors[field] = true;
    }
    if (!form.agree) newErrors.agree = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    // 목업이므로 실제 전송 없이 알림만 표시
    setTimeout(() => {
      console.log('Form submitted:', { ...form, videoFile, thumbnailFile, snsImages });
      alert('접수하기 - Success!');
      setIsSubmitting(false);
    }, 800);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl outline-none transition-colors ${
      hasError ? '' : ''
    }`;

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    backgroundColor: 'rgba(27,20,100,0.4)',
    border: hasError ? '1px solid var(--ar-point)' : '1px solid rgba(245,240,232,0.1)',
    color: 'var(--ar-cream)',
  });

  return (
    <section id="apply" className="relative py-24 md:py-32">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.2), var(--ar-primary-dark))' }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-4"
          style={{ color: 'var(--ar-cream)' }}
        >
          공모전 접수
        </h2>
        <p className="arirang-animate text-center mb-12" style={{ color: 'rgba(245,240,232,0.5)' }}>
          참가 신청서
        </p>

        <form
          onSubmit={handleSubmit}
          className="arirang-animate p-6 md:p-10 rounded-3xl backdrop-blur-sm space-y-6"
          style={{
            backgroundColor: 'rgba(13,11,26,0.8)',
            border: '1px solid rgba(245,240,232,0.1)',
          }}
        >
          {/* 이름, 이메일, 연락처 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="apply-name" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
                이름 (팀명) <span style={{ color: 'var(--ar-point)' }}>*</span>
              </label>
              <input
                id="apply-name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="홍길동"
                className={inputClass(!!errors.name)}
                style={inputStyle(!!errors.name)}
              />
            </div>
            <div>
              <label htmlFor="apply-email" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
                이메일 <span style={{ color: 'var(--ar-point)' }}>*</span>
              </label>
              <input
                id="apply-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="example@email.com"
                className={inputClass(!!errors.email)}
                style={inputStyle(!!errors.email)}
              />
            </div>
            <div>
              <label htmlFor="apply-phone" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
                연락처 <span style={{ color: 'var(--ar-point)' }}>*</span>
              </label>
              <input
                id="apply-phone"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="010-0000-0000"
                className={inputClass(!!errors.phone)}
                style={inputStyle(!!errors.phone)}
              />
            </div>
          </div>

          {/* 작품명 */}
          <div>
            <label htmlFor="apply-videoTitle" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
              작품명 <span style={{ color: 'var(--ar-point)' }}>*</span>
            </label>
            <input
              id="apply-videoTitle"
              value={form.videoTitle}
              onChange={(e) => updateField('videoTitle', e.target.value)}
              placeholder="나의 아리랑 이야기"
              className={inputClass(!!errors.videoTitle)}
              style={inputStyle(!!errors.videoTitle)}
            />
          </div>

          {/* 작품 설명 */}
          <div>
            <label htmlFor="apply-description" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
              작품 설명 <span style={{ color: 'var(--ar-point)' }}>*</span>
            </label>
            <textarea
              id="apply-description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="작품의 주제와 제작 의도를 간단히 설명해주세요."
              rows={4}
              className={`${inputClass(!!errors.description)} resize-none`}
              style={inputStyle(!!errors.description)}
            />
          </div>

          {/* AI 도구 */}
          <div>
            <label htmlFor="apply-aiTools" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
              사용한 AI 도구
            </label>
            <input
              id="apply-aiTools"
              value={form.aiTools}
              onChange={(e) => updateField('aiTools', e.target.value)}
              placeholder="예: Sora, Runway, Midjourney 등"
              className={inputClass(!!errors.aiTools)}
              style={inputStyle(!!errors.aiTools)}
            />
          </div>

          {/* 썸네일 + 영상 업로드 (나란히) */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 썸네일 업로드 */}
            <div>
              <label htmlFor="apply-thumbnail" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
                썸네일 이미지 업로드 <span style={{ color: 'var(--ar-point)' }}>*</span>
              </label>
              <p className="text-xs mb-2" style={{ color: 'rgba(245,240,232,0.4)' }}>
                JPG, PNG 형식, 권장 1920×1080px
              </p>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                onDrop={handleThumbnailDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-full flex flex-col items-center justify-center p-6 min-h-[160px] rounded-2xl cursor-pointer transition-colors overflow-hidden"
                style={{ border: '2px dashed rgba(245,240,232,0.15)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,232,0.15)'; }}
              >
                {thumbnailPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreview}
                      alt="썸네일 미리보기"
                      className="max-h-28 rounded-lg object-contain"
                    />
                    <span className="text-xs truncate max-w-[180px]" style={{ color: 'rgba(245,240,232,0.5)' }}>
                      {thumbnailFile?.name}
                    </span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-9 h-9 mb-2" style={{ color: 'rgba(245,240,232,0.3)' }} />
                    <span className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>
                      썸네일 이미지를 드래그하거나 클릭하여 업로드
                    </span>
                  </>
                )}
              </button>
              <input id="apply-thumbnail" ref={thumbnailInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; handleThumbnail(file ?? null); }} />
            </div>
            <div>
              <label htmlFor="apply-video" className="block text-sm mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
                영상 파일 업로드 <span style={{ color: 'var(--ar-point)' }}>*</span>
              </label>
              <p className="text-xs mb-2" style={{ color: 'rgba(245,240,232,0.4)' }}>
                MP4 형식, 30초~90초, 최대 500MB
              </p>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                onDrop={handleVideoDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-full flex flex-col items-center justify-center p-6 min-h-[160px] rounded-2xl cursor-pointer transition-colors"
                style={{ border: '2px dashed rgba(245,240,232,0.15)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,232,0.15)'; }}
              >
                {videoFile ? (
                  <span className="flex items-center gap-3" style={{ color: 'var(--ar-accent)' }}>
                    <FileVideo className="w-8 h-8 shrink-0" />
                    <span className="text-left">
                      <span className="block font-medium text-sm truncate max-w-[180px]">{videoFile.name}</span>
                      <span className="block text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </span>
                  </span>
                ) : (
                  <>
                    <Upload className="w-9 h-9 mb-2" style={{ color: 'rgba(245,240,232,0.3)' }} />
                    <span className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>파일을 드래그하거나 클릭하여 업로드</span>
                  </>
                )}
              </button>
              <input id="apply-video" ref={videoInputRef} type="file" accept="video/mp4" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setVideoFile(file); }} />
            </div>
          </div>

          {/* 가산점 인증 (선택) */}
          <div>
            <p className="text-sm mb-3" style={{ color: 'rgba(245,240,232,0.7)' }}>가산점 인증 (선택)</p>
            <div className="space-y-2">
              {bonusItems.map((item, idx) => {
                const isOpen = openBonuses.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(245,240,232,0.08)' }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleBonus(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(27,20,100,0.2)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--ar-cream)' }}>
                        {item.label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'rgba(245,240,232,0.4)' }}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {/* SNS 게시물 URL */}
                        <input
                          value={form[`snsUrl${item.id}` as keyof FormData] as string}
                          onChange={(e) => updateField(`snsUrl${item.id}` as keyof FormData, e.target.value)}
                          placeholder="SNS 게시물 URL (예: https://instagram.com/p/...)"
                          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                          style={{
                            backgroundColor: 'rgba(27,20,100,0.4)',
                            border: '1px solid rgba(245,240,232,0.1)',
                            color: 'var(--ar-cream)',
                          }}
                        />
                        {/* 캡처 이미지 업로드 */}
                        <button
                          type="button"
                          onClick={() => snsImageRefs[idx].current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-left"
                          style={{ border: '1px solid rgba(245,240,232,0.1)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.3)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,232,0.1)'; }}
                        >
                          <ImageIcon className="w-4 h-4" style={{ color: 'rgba(245,240,232,0.4)' }} />
                          <span className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>
                            {snsImages[idx] ? snsImages[idx]!.name : '캡처 이미지 업로드'}
                          </span>
                        </button>
                        <input
                          type="file"
                          ref={snsImageRefs[idx]}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleSnsImage(idx, file ?? null);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 동의 체크박스 */}
          <div className="flex items-start gap-3">
            <input
              id="apply-agree"
              type="checkbox"
              checked={form.agree}
              onChange={(e) => updateField('agree', e.target.checked)}
              className="mt-1 w-5 h-5 rounded cursor-pointer"
              style={{
                backgroundColor: 'rgba(27,20,100,0.4)',
                border: '1px solid rgba(245,240,232,0.2)',
                accentColor: 'var(--ar-accent)',
              }}
            />
            <label
              htmlFor="apply-agree"
              className="text-sm cursor-pointer"
              style={{ color: errors.agree ? 'var(--ar-point)' : 'rgba(245,240,232,0.6)' }}
            >
              유의사항 및 저작권 안내에 동의합니다
            </label>
          </div>

          {/* 접수 버튼 */}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full py-4 font-bold text-lg rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--ar-accent)',
              color: 'var(--ar-primary-dark)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ar-accent-light)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ar-accent)'; }}
          >
            <Send className="w-5 h-5" />
            접수하기
          </button>
        </form>
      </div>
    </section>
  );
}

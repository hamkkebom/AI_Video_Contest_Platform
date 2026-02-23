'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileEditPage() {
  const [formData, setFormData] = useState({
    name: '김영상',
    email: 'user@example.com',
    bio: '영상 제작자이자 AI 애호가입니다. 창의적인 작품을 만드는 것을 좋아합니다.',
    socialLinks: {
      instagram: 'https://instagram.com/user',
      youtube: 'https://youtube.com/@user',
      portfolio: 'https://portfolio.com/user',
    },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (platform: keyof typeof formData.socialLinks, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleSave = () => {
    alert('목업 페이지입니다. 저장 기능은 아직 구현되지 않았습니다.');
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">프로필 편집</h1>
        <p className="text-sm text-muted-foreground">프로필 정보와 포트폴리오 링크를 최신 상태로 유지해보세요.</p>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>프로필 미리보기</CardTitle>
            <CardDescription>공개 페이지에 표시될 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-5 text-center">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">김</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{formData.name}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                프로필 사진 변경
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">소개</p>
              <p className="mt-2 text-sm text-foreground">{formData.bio}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>변경사항은 저장 버튼을 눌러 반영할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" name="email" type="email" value={formData.email} readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="min-h-28 resize-none"
                placeholder="자신을 소개해주세요"
              />
              <p className="text-xs text-muted-foreground">최대 500자까지 입력 가능합니다.</p>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              <p className="font-semibold">소셜 링크</p>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(event) => handleSocialLinkChange('instagram', event.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={formData.socialLinks.youtube}
                  onChange={(event) => handleSocialLinkChange('youtube', event.target.value)}
                  placeholder="https://youtube.com/@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">포트폴리오</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.socialLinks.portfolio}
                  onChange={(event) => handleSocialLinkChange('portfolio', event.target.value)}
                  placeholder="https://portfolio.com/username"
                />
              </div>
            </div>

             <div className="grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-2">
               <Button onClick={handleSave} className="bg-accent-foreground text-white hover:bg-accent-foreground/90">저장</Button>
               <Button variant="outline">취소</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

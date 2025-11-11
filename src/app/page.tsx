"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";

type Campaign = {
  id: string;
  title: string;
  recruitment_start_date: string;
  recruitment_end_date: string;
  recruitment_count: number;
  benefits: string;
  store_info: string;
  mission: string;
  status: string;
  advertiser: {
    company_name: string;
    address: string;
  };
};

export default function HomePage() {
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const result = await res.json();
        // 백엔드가 { data: [...] } 형태로 반환
        const data = result.data || result;
        setCampaigns(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">체험단 플랫폼</h1>
        <p className="text-lg text-gray-600">
          다양한 체험단에 지원하고 혜택을 받아보세요
        </p>
      </div>

      {/* 체험단 목록 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">모집 중인 체험단</h2>
          <div className="flex gap-2">
            {!profileLoading && profile ? (
              <>
                {profile.role === "advertiser" && profile.roleProfile && (
                  <Button onClick={() => router.push("/advertiser/dashboard")}>
                    광고주 대시보드
                  </Button>
                )}
                {profile.role === "influencer" && profile.roleProfile && (
                  <Button onClick={() => router.push("/my-applications")}>
                    내 지원 목록
                  </Button>
                )}
                {!profile.roleProfile && (
                  <Button onClick={() => router.push("/onboarding")}>
                    정보 등록
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/login")}>
                  로그인
                </Button>
                <Button onClick={() => router.push("/signup")}>회원가입</Button>
              </>
            )}
          </div>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              현재 모집 중인 체험단이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">모집중</Badge>
                    <span className="text-sm text-gray-500">
                      {campaign.recruitment_count}명
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {campaign.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">광고주</p>
                      <p className="text-gray-600">
                        {campaign.advertiser.company_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">제공 혜택</p>
                      <p className="text-gray-600 line-clamp-2">
                        {campaign.benefits}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">모집 기간</p>
                      <p className="text-gray-600">
                        {formatDate(campaign.recruitment_start_date)} ~{" "}
                        {formatDate(campaign.recruitment_end_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

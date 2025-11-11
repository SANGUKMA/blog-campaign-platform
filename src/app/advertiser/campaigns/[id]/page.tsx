"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  status: "recruiting" | "closed" | "completed";
};

type Application = {
  id: string;
  message: string;
  visit_date: string;
  status: "pending" | "selected" | "rejected";
  created_at: string;
  influencer: {
    channel_name: string;
    channel_url: string;
    follower_count: number;
    profile: {
      name: string;
      phone: string;
      email: string;
      birth_date: string;
    };
  };
};

const statusMap = {
  recruiting: { label: "모집중", color: "bg-blue-500" },
  closed: { label: "모집종료", color: "bg-yellow-500" },
  completed: { label: "선정완료", color: "bg-green-500" },
};

export default function AdvertiserCampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading: profileLoading, hasAdvertiserProfile } = useProfile();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 권한 체크
  useEffect(() => {
    if (!profileLoading && !hasAdvertiserProfile) {
      alert("광고주만 접근할 수 있습니다.");
      router.replace("/");
    }
  }, [profileLoading, hasAdvertiserProfile, router]);

  useEffect(() => {
    if (hasAdvertiserProfile) {
      fetchData();
    }
  }, [hasAdvertiserProfile]);

  const fetchData = async () => {
    try {
      // 캠페인 정보 가져오기
      const campaignRes = await fetch(`/api/campaigns/${params.id}`);
      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData.data);
      }

      // 지원자 목록 가져오기
      const appsRes = await fetch(`/api/applications/campaign/${params.id}`);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCampaign = async () => {
    if (!confirm("모집을 종료하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/campaigns/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to close campaign:", error);
    }
  };

  const handleSelectInfluencers = async () => {
    if (selectedIds.length === 0) {
      alert("선정할 인플루언서를 선택해주세요.");
      return;
    }

    if (!confirm(`${selectedIds.length}명을 선정하시겠습니까?`)) return;

    try {
      // 선정된 인플루언서들
      const res1 = await fetch(`/api/applications/campaign/${params.id}/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: selectedIds,
          status: "selected",
        }),
      });

      // 나머지는 반려
      const unselectedIds = applications
        .filter((app) => !selectedIds.includes(app.id) && app.status === "pending")
        .map((app) => app.id);

      if (unselectedIds.length > 0) {
        await fetch(`/api/applications/campaign/${params.id}/bulk`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationIds: unselectedIds,
            status: "rejected",
          }),
        });
      }

      if (res1.ok) {
        alert("선정이 완료되었습니다!");
        setSelectedIds([]);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to select influencers:", error);
      alert("선정 처리 중 오류가 발생했습니다.");
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
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

  if (!campaign) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center">체험단을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-16 px-4">
      <Button
        variant="outline"
        onClick={() => router.push("/advertiser/dashboard")}
        className="mb-6"
      >
        ← 대시보드로
      </Button>

      {/* 캠페인 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge className={statusMap[campaign.status].color}>
              {statusMap[campaign.status].label}
            </Badge>
            <span className="text-sm text-gray-500">
              모집인원: {campaign.recruitment_count}명
            </span>
          </div>
          <CardTitle className="text-2xl">{campaign.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">모집 기간</p>
              <p className="text-gray-600">
                {formatDate(campaign.recruitment_start_date)} ~{" "}
                {formatDate(campaign.recruitment_end_date)}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">지원자 수</p>
              <p className="text-gray-600">{applications.length}명</p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-4 flex gap-2">
            {campaign.status === "recruiting" && (
              <Button onClick={handleCloseCampaign} variant="outline">
                모집 종료
              </Button>
            )}
            {campaign.status === "closed" && (
              <Button
                onClick={handleSelectInfluencers}
                disabled={selectedIds.length === 0}
              >
                선정 완료 ({selectedIds.length}명)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 지원자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>지원자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 지원자가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    {campaign.status === "closed" &&
                      application.status === "pending" && (
                        <Checkbox
                          checked={selectedIds.includes(application.id)}
                          onCheckedChange={() =>
                            toggleSelection(application.id)
                          }
                        />
                      )}

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {application.influencer.profile.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {application.influencer.channel_name} (팔로워:{" "}
                            {application.influencer.follower_count.toLocaleString()}
                            명)
                          </p>
                        </div>
                        <Badge
                          variant={
                            application.status === "selected"
                              ? "default"
                              : application.status === "rejected"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {application.status === "pending"
                            ? "대기중"
                            : application.status === "selected"
                            ? "선정"
                            : "반려"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">연락처</p>
                          <p className="text-gray-600">
                            {application.influencer.profile.phone}
                          </p>
                          <p className="text-gray-600">
                            {application.influencer.profile.email}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">SNS 채널</p>
                          <a
                            href={application.influencer.channel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {application.influencer.channel_url}
                          </a>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            방문 예정일
                          </p>
                          <p className="text-gray-600">
                            {formatDate(application.visit_date)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">지원일</p>
                          <p className="text-gray-600">
                            {formatDate(application.created_at)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-medium text-gray-700 mb-1">
                            각오 한마디
                          </p>
                          <p className="text-gray-600">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


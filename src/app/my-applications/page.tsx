"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";

type Application = {
  id: string;
  message: string;
  visit_date: string;
  status: "pending" | "selected" | "rejected";
  created_at: string;
  campaign: {
    title: string;
    benefits: string;
    recruitment_end_date: string;
    status: string;
  };
};

const statusMap = {
  pending: { label: "신청완료", color: "bg-blue-500" },
  selected: { label: "선정", color: "bg-green-500" },
  rejected: { label: "반려", color: "bg-gray-500" },
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { isLoading: profileLoading, hasInfluencerProfile } = useProfile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  // 권한 체크
  useEffect(() => {
    if (!profileLoading && !hasInfluencerProfile) {
      alert("인플루언서만 접근할 수 있습니다.");
      router.replace("/");
    }
  }, [profileLoading, hasInfluencerProfile, router]);

  useEffect(() => {
    if (hasInfluencerProfile) {
      fetchApplications();
    }
  }, [filter, hasInfluencerProfile]);

  const fetchApplications = async () => {
    try {
      const url = filter
        ? `/api/applications/my?status=${filter}`
        : "/api/applications/my";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
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
    <div className="container max-w-6xl mx-auto py-16 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">내 지원 목록</h1>

        {/* 필터 버튼 */}
        <div className="flex gap-2">
          <Button
            variant={filter === null ? "default" : "outline"}
            onClick={() => setFilter(null)}
          >
            전체
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            신청완료
          </Button>
          <Button
            variant={filter === "selected" ? "default" : "outline"}
            onClick={() => setFilter("selected")}
          >
            선정
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            onClick={() => setFilter("rejected")}
          >
            반려
          </Button>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            지원 내역이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {application.campaign.title}
                    </CardTitle>
                  </div>
                  <Badge className={statusMap[application.status].color}>
                    {statusMap[application.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">지원일</p>
                    <p className="text-gray-600">
                      {formatDate(application.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">방문 예정일</p>
                    <p className="text-gray-600">
                      {formatDate(application.visit_date)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-700 mb-1">각오 한마디</p>
                    <p className="text-gray-600">{application.message}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-700 mb-1">제공 혜택</p>
                    <p className="text-gray-600">
                      {application.campaign.benefits}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


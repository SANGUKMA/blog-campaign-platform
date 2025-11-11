"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Campaign = {
  id: string;
  title: string;
  recruitment_start_date: string;
  recruitment_end_date: string;
  recruitment_count: number;
  status: "recruiting" | "closed" | "completed";
  created_at: string;
};

const statusMap = {
  recruiting: { label: "모집중", color: "bg-blue-500" },
  closed: { label: "모집종료", color: "bg-yellow-500" },
  completed: { label: "선정완료", color: "bg-green-500" },
};

export default function AdvertiserDashboardPage() {
  const router = useRouter();
  const { profile, isLoading: profileLoading, hasAdvertiserProfile } = useProfile();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 권한 체크
  useEffect(() => {
    if (!profileLoading && !hasAdvertiserProfile) {
      alert("광고주만 접근할 수 있습니다.");
      router.replace("/");
    }
  }, [profileLoading, hasAdvertiserProfile, router]);

  const [formData, setFormData] = useState({
    title: "",
    recruitmentStartDate: "",
    recruitmentEndDate: "",
    recruitmentCount: 1,
    benefits: "",
    storeInfo: "",
    mission: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns/my");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "체험단 등록에 실패했습니다");
      }

      setIsDialogOpen(false);
      setFormData({
        title: "",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        recruitmentCount: 1,
        benefits: "",
        storeInfo: "",
        mission: "",
      });
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">체험단 관리</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>신규 체험단 등록</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>체험단 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">체험단명</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recruitmentStartDate">모집 시작일</Label>
                  <Input
                    id="recruitmentStartDate"
                    type="date"
                    required
                    value={formData.recruitmentStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recruitmentStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="recruitmentEndDate">모집 종료일</Label>
                  <Input
                    id="recruitmentEndDate"
                    type="date"
                    required
                    value={formData.recruitmentEndDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recruitmentEndDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recruitmentCount">모집 인원</Label>
                <Input
                  id="recruitmentCount"
                  type="number"
                  min="1"
                  required
                  value={formData.recruitmentCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recruitmentCount: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="benefits">제공 혜택</Label>
                <Textarea
                  id="benefits"
                  required
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) =>
                    setFormData({ ...formData, benefits: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="storeInfo">매장 정보</Label>
                <Textarea
                  id="storeInfo"
                  required
                  rows={2}
                  value={formData.storeInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, storeInfo: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="mission">미션</Label>
                <Textarea
                  id="mission"
                  required
                  rows={3}
                  value={formData.mission}
                  onChange={(e) =>
                    setFormData({ ...formData, mission: e.target.value })
                  }
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "등록 중..." : "등록"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            등록된 체험단이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() =>
                router.push(`/advertiser/campaigns/${campaign.id}`)
              }
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={statusMap[campaign.status].color}>
                    {statusMap[campaign.status].label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {campaign.recruitment_count}명
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {campaign.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">모집 기간</p>
                    <p className="text-gray-600">
                      {formatDate(campaign.recruitment_start_date)} ~{" "}
                      {formatDate(campaign.recruitment_end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">등록일</p>
                    <p className="text-gray-600">
                      {formatDate(campaign.created_at)}
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


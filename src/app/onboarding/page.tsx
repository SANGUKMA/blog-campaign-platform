"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Step = "profile" | "role" | "detail";
type Role = "advertiser" | "influencer" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [role, setRole] = useState<Role>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 공통 프로필 정보
  const [profileData, setProfileData] = useState({
    name: "",
    birthDate: "",
    phone: "",
    email: "",
  });

  // 초기화: 프로필 확인 및 이메일 자동 입력
  useEffect(() => {
    const initialize = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.replace("/login");
          return;
        }

        // 이메일 자동 입력
        setProfileData(prev => ({
          ...prev,
          email: user.email || "",
        }));

        // 기존 프로필 확인 (선택적)
        try {
          const profileRes = await fetch("/api/profile");
          if (profileRes.ok) {
            const profileResData = await profileRes.json();
            const existingProfile = profileResData.data;
            
            if (existingProfile) {
              // 이미 프로필이 있으면
              if (existingProfile.role && existingProfile.roleProfile) {
                // 완전히 온보딩 완료된 경우 - 역할별 페이지로
                if (existingProfile.role === "advertiser") {
                  router.replace("/advertiser/dashboard");
                } else {
                  router.replace("/");
                }
                return;
              } else if (existingProfile.role) {
                // 역할만 선택된 경우 - 역할별 정보 입력으로
                setRole(existingProfile.role);
                setStep("detail");
              }
            }
          }
        } catch (profileError) {
          console.error("Profile check error (non-critical):", profileError);
          // 프로필 체크 실패해도 온보딩은 진행 가능
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  // 인플루언서 정보
  const [influencerData, setInfluencerData] = useState({
    channelName: "",
    channelUrl: "",
    followerCount: 0,
  });

  // 광고주 정보
  const [advertiserData, setAdvertiserData] = useState({
    companyName: "",
    address: "",
    businessPhone: "",
    businessNumber: "",
    representativeName: "",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 기본 정보만 저장하고 다음 단계로 (API 호출하지 않음)
    setStep("role");
  };

  const handleRoleSelect = (selectedRole: "advertiser" | "influencer") => {
    setRole(selectedRole);
    setStep("detail");
  };

  const handleDetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1단계: 공통 프로필 생성
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          role: role,
        }),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.message || "프로필 생성에 실패했습니다");
      }

      // 2단계: 역할별 프로필 생성
      const endpoint = role === "advertiser" ? "/api/profile/advertiser" : "/api/profile/influencer";
      const data = role === "advertiser" ? advertiserData : influencerData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || "정보 등록에 실패했습니다");
      }

      // 역할별로 페이지 이동
      if (role === "advertiser") {
        router.push("/advertiser/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  // 공통 프로필 입력 단계
  if (step === "profile") {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">기본 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  required
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="birthDate">생년월일</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={profileData.birthDate}
                  onChange={(e) =>
                    setProfileData({ ...profileData, birthDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="phone">휴대폰번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  required
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">이메일 (자동입력)</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  disabled
                  value={profileData.email}
                  className="bg-gray-100"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full">
                다음
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 역할 선택 단계
  if (step === "role") {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">역할을 선택해주세요</h1>
          <p className="text-gray-600">
            어떤 서비스를 이용하고 싶으신가요?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:border-blue-500 transition"
            onClick={() => handleRoleSelect("influencer")}
          >
            <CardHeader>
              <CardTitle className="text-xl">인플루언서</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                체험단에 지원하고 다양한 혜택을 경험하세요
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ 체험단 탐색</li>
                <li>✓ 체험단 지원</li>
                <li>✓ 내 지원 목록 관리</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-blue-500 transition"
            onClick={() => handleRoleSelect("advertiser")}
          >
            <CardHeader>
              <CardTitle className="text-xl">광고주</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                체험단을 등록하고 인플루언서를 관리하세요
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ 체험단 등록 및 관리</li>
                <li>✓ 지원자 확인</li>
                <li>✓ 인플루언서 선정</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 상세 정보 입력 단계
  if (step === "detail" && role === "influencer") {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">인플루언서 정보 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDetailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="channelName">SNS 채널명</Label>
                <Input
                  id="channelName"
                  required
                  placeholder="예: 맛집탐방 블로그"
                  value={influencerData.channelName}
                  onChange={(e) =>
                    setInfluencerData({
                      ...influencerData,
                      channelName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="channelUrl">채널 링크</Label>
                <Input
                  id="channelUrl"
                  type="url"
                  required
                  placeholder="https://blog.naver.com/..."
                  value={influencerData.channelUrl}
                  onChange={(e) =>
                    setInfluencerData({
                      ...influencerData,
                      channelUrl: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="followerCount">팔로워 수</Label>
                <Input
                  id="followerCount"
                  type="number"
                  min="0"
                  required
                  value={influencerData.followerCount}
                  onChange={(e) =>
                    setInfluencerData({
                      ...influencerData,
                      followerCount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="w-full"
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "등록 중..." : "완료"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "detail" && role === "advertiser") {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">광고주 정보 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDetailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="companyName">업체명</Label>
                <Input
                  id="companyName"
                  required
                  value={advertiserData.companyName}
                  onChange={(e) =>
                    setAdvertiserData({
                      ...advertiserData,
                      companyName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  required
                  value={advertiserData.address}
                  onChange={(e) =>
                    setAdvertiserData({
                      ...advertiserData,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="businessPhone">업장 전화번호</Label>
                <Input
                  id="businessPhone"
                  type="tel"
                  required
                  placeholder="02-1234-5678"
                  value={advertiserData.businessPhone}
                  onChange={(e) =>
                    setAdvertiserData({
                      ...advertiserData,
                      businessPhone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="businessNumber">사업자등록번호</Label>
                <Input
                  id="businessNumber"
                  required
                  placeholder="123-45-67890"
                  value={advertiserData.businessNumber}
                  onChange={(e) =>
                    setAdvertiserData({
                      ...advertiserData,
                      businessNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="representativeName">대표자명</Label>
                <Input
                  id="representativeName"
                  required
                  value={advertiserData.representativeName}
                  onChange={(e) =>
                    setAdvertiserData({
                      ...advertiserData,
                      representativeName: e.target.value,
                    })
                  }
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="w-full"
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "등록 중..." : "완료"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}


"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApplyCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    message: "",
    visitDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: params.id,
          message: formData.message,
          visitDate: formData.visitDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "지원에 실패했습니다");
      }

      alert("지원이 완료되었습니다!");
      router.push("/my-applications");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← 뒤로가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">체험단 지원하기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="message">각오 한마디</Label>
              <Textarea
                id="message"
                required
                placeholder="체험단에 대한 각오를 자유롭게 작성해주세요."
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="visitDate">방문 예정일</Label>
              <Input
                id="visitDate"
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) =>
                  setFormData({ ...formData, visitDate: e.target.value })
                }
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "제출 중..." : "지원하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


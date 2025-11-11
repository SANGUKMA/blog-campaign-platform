import { useEffect, useState } from "react";

type Profile = {
  id: string;
  name: string;
  birth_date: string;
  phone: string;
  email: string;
  role: "advertiser" | "influencer" | null;
  roleProfile: any;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError("프로필을 불러올 수 없습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    fetchProfile();
  };

  return {
    profile,
    isLoading,
    error,
    refresh,
    isAdvertiser: profile?.role === "advertiser",
    isInfluencer: profile?.role === "influencer",
    hasAdvertiserProfile: profile?.role === "advertiser" && !!profile?.roleProfile,
    hasInfluencerProfile: profile?.role === "influencer" && !!profile?.roleProfile,
  };
}


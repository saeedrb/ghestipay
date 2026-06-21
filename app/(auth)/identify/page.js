"use client";

import { useEffect, useState } from "react";

import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/Input";
import Button from "@/shared/components/ui/Button";
import Background from "@/shared/components/ui/Background";
import Loading from "@/shared/components/ui/Loading";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useRouter } from "next/navigation";

export default function VerifyIdentityPage() {
  const { identify } = useAuth();

  const [nationalCode, setNationalCode] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const loading = identify.isPending;
  const router = useRouter();

  const user = useAuthStore(s =>  s.user);

  useEffect(() => {
    console.log(user)
    if(user[0]?.identify_data?.status == 'verified') {
      router.replace('/user/dashboard')
    }
  }, [user]);

  const normalizeBirthDate = (value) => value.replace(/\D/g, "");

  const handleSubmit = () => {
    setError("");

    const national = nationalCode.trim();
    const birth = normalizeBirthDate(birthDate);

    if (!national) {
      setError("کد ملی الزامی است");
      return;
    }

    if (!/^\d{10}$/.test(national)) {
      setError("کد ملی باید 10 رقم باشد");
      return;
    }

    if (!birth) {
      setError("تاریخ تولد الزامی است");
      return;
    }

    if (!/^\d{8}$/.test(birth)) {
      setError("فرمت تاریخ تولد باید 8 رقم باشد. می‌توانید به صورت 1371/10/05 یا 13711005 وارد کنید");
      return;
    }

    identify.mutate(
      {
        national_code: national,
        birth_date: birth,
      },
      {
        onError: (err) => {
          setError(err?.response?.data?.message || err.message || "خطا در احراز هویت");
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">

      <Background />

      <Card className="relative z-10 w-full max-w-md mx-4 p-6">

        <div className="text-center mb-8">
          <div
            className="
              mx-auto mb-4
              h-14 w-14
              rounded-2xl
              bg-blue-500/10
              flex items-center justify-center
            "
          >
            🪪
          </div>

          <h1 className="text-lg font-bold">
            احراز هویت
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            برای استفاده از خدمات، اطلاعات هویتی خود را تکمیل کنید
          </p>
        </div>

        <div className="space-y-5">
          <Input
            label="کد ملی"
            value={nationalCode}
            onChange={(e) => setNationalCode(e.target.value)}
            placeholder="مثال: 1234567890"
          />

          <Input
            label="تاریخ تولد"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            placeholder="1375/01/01"
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "در حال ارسال..." : "ادامه"}
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          اطلاعات شما به صورت امن نگهداری می‌شود
        </p>
      </Card>

      {loading && <Loading fullscreen message="در حال احراز هویت..." />}
    </div>
  );
}
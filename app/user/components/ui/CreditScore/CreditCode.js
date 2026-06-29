"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, ShieldCheck } from "lucide-react";
import Button from "@/shared/components/ui/Button";
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/Input";

function getRemainingSeconds(canResendAfter) {
  if (!canResendAfter) return 0;

  if (typeof canResendAfter === "number") {
    return Math.max(0, Math.ceil(canResendAfter));
  }

  const targetTime = new Date(canResendAfter).getTime();
  if (Number.isNaN(targetTime)) return 0;

  return Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
}

function formatTimer(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const restSeconds = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${restSeconds}`;
}

export default function CreditCode({
  phone,
  onRequestCode,
  onSubmitCode,
  canResendAfter,
  requesting = false,
  submitting = false,
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(canResendAfter),
  );

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timerId = setTimeout(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timerId);
  }, [remainingSeconds]);

  const handleCodeChange = (event) => {
    setError("");
    setCode(event.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12));
  };

  const handleSubmit = () => {
    if (!code) {
      setError("کد اعتبارسنجی را وارد کنید");
      return;
    }

    onSubmitCode?.(code);
  };

  return (
    <Card className="mt-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900">کد اعتبارسنجی</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            برای انجام اعتبارسنجی، ابتدا کد را دریافت کنید. کدی که به شماره موبایل شما ارسال می‌شود را در این بخش وارد و ثبت کنید تا فرایند اعتبارسنجی انجام شود.
          </p>
          {phone && (
            <p className="mt-2 text-xs font-medium text-gray-500" dir="ltr">
              {phone}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="mb-4 flex items-start gap-2 text-xs leading-6 text-gray-500">
          <MessageSquareText size={16} className="mt-1 shrink-0 text-blue-600" />
          <span>
            اگر هنوز کدی دریافت نکرده‌اید، روی دکمه دریافت کد بزنید و پس از دریافت پیامک، کد را ثبت کنید.
          </span>
        </div>

        <Input
          dir="ltr"
          error={error}
          inputMode="text"
          label="کد اعتبارسنجی"
          onChange={handleCodeChange}
          placeholder="مثلاً B459E8E8D2"
          value={code}
        />

        <div className="grid grid-cols-2 gap-3">
          <Button
            disabled={submitting || !code}
            onClick={handleSubmit}
          >
            {submitting ? "در حال ثبت..." : "تایید"}
          </Button>

          <Button
            disabled={requesting || remainingSeconds > 0}
            onClick={onRequestCode}
            variant="secondary"
          >
            {requesting
              ? "در حال ارسال..."
              : remainingSeconds > 0
                ? formatTimer(remainingSeconds)
                : "ارسال مجدد"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

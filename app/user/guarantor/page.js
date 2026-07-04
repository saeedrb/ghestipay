"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import Button from "@/shared/components/ui/Button";
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/Input";
import ProgressStepper from "@/shared/components/ui/ProgressStepper";
import {
  useGetGuarantorScoreResult,
  useInstallment,
} from "@/shared/hooks/useInstallment";

const GUARANTOR_STEPS = ["اعتبارسنجی", "کد تایید", "نتیجه"];

function getInitialStage({ step, status, nextStep }) {
  if (step) return step;
  if (status === "credit_score_result_pending") return status;
  if (nextStep === "credit_score_result_pending") return nextStep;
  return "waiting_credit_score";
}

function getCurrentStep(stage) {
  switch (stage) {
    case "waiting_credit_score":
      return 1;
    case "credit_code":
    case "credit_score_otp_sent":
    case "waiting_otp":
      return 2;
    case "credit_score_result_pending":
    case "approved":
    case "completed":
      return 3;
    default:
      return 1;
  }
}

function getApiErrorMessage(error, fallback = "خطایی رخ داد. لطفاً دوباره تلاش کنید.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function getResultData(response) {
  return response?.data?.data || response?.data || response || null;
}

export default function GuarantorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestId = searchParams.get("id") || "";
  const status = searchParams.get("status") || "";
  const nextStep = searchParams.get("next_step") || "";
  const stage = useMemo(
    () =>
      getInitialStage({
        step: searchParams.get("step"),
        status,
        nextStep,
      }),
    [nextStep, searchParams, status],
  );
  const currentStep = getCurrentStep(stage);
  const {
    getVerifyCodeForGuarantorCreditScore,
    ResendVerifyCodeForGuarantorCreditScore,
    verifyGuarantorCreditScore,
  } = useInstallment();

  const goToStage = (targetStage) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("step", targetStage);
    if (requestId) params.set("id", requestId);
    if (status) params.set("status", status);
    if (nextStep) params.set("next_step", nextStep);

    router.replace(`/user/guarantor?${params.toString()}`);
  };

  const handleRequestCreditCode = ({ onError }) => {
    if (
      stage === "credit_score_result_pending" ||
      status === "credit_score_result_pending" ||
      nextStep === "credit_score_result_pending"
    ) {
      goToStage("credit_score_result_pending");
      return;
    }

    if (!requestId) {
      onError?.("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    getVerifyCodeForGuarantorCreditScore.mutate(
      { requestId },
      {
        onSuccess: () => goToStage("credit_code"),
        onError: (error) =>
          onError?.(getApiErrorMessage(error, "ارسال کد تایید ناموفق بود.")),
      },
    );
  };

  const handleVerifyCreditCode = ({ code, onError }) => {
    if (!requestId) {
      onError?.("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    verifyGuarantorCreditScore.mutate(
      { requestId, code },
      {
        onSuccess: () => goToStage("credit_score_result_pending"),
        onError: (error) =>
          onError?.(getApiErrorMessage(error, "کد وارد شده معتبر نیست.")),
      },
    );
  };

  const handleResendCreditCode = ({ onError }) => {
    if (!requestId) {
      onError?.("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    ResendVerifyCodeForGuarantorCreditScore.mutate(
      { requestId },
      {
        onError: (error) =>
          onError?.(getApiErrorMessage(error, "ارسال مجدد کد تایید ناموفق بود.")),
      },
    );
  };

  const renderStepContent = () => {
    switch (stage) {
      case "waiting_credit_score":
        return (
          <GuarantorCreditIntro
            loading={getVerifyCodeForGuarantorCreditScore.isPending}
            onContinue={handleRequestCreditCode}
            requestId={requestId}
          />
        );

      case "credit_code":
      case "credit_score_otp_sent":
      case "waiting_otp":
        return (
          <GuarantorCreditCode
            loading={verifyGuarantorCreditScore.isPending}
            onContinue={handleVerifyCreditCode}
            onResend={handleResendCreditCode}
            requestId={requestId}
            resending={ResendVerifyCodeForGuarantorCreditScore.isPending}
          />
        );

      case "credit_score_result_pending":
      case "approved":
      case "completed":
        return (
          <GuarantorCreditResult requestId={requestId} />
        );

      default:
        return (
          <GuarantorCreditIntro
            loading={getVerifyCodeForGuarantorCreditScore.isPending}
            onContinue={handleRequestCreditCode}
            requestId={requestId}
          />
        );
    }
  };

  return (
    <div className="flex w-full flex-col px-4 pt-6">
      <ProgressStepper currentStep={currentStep} steps={GUARANTOR_STEPS} />
      {renderStepContent()}
    </div>
  );
}

function GuarantorCreditIntro({ requestId, loading, onContinue }) {
  const [error, setError] = useState("");

  const handleContinue = () => {
    setError("");
    onContinue?.({ onError: setError });
  };

  return (
    <Card className="mt-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldCheck size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900">
            اعتبارسنجی ضامن
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            برای ادامه فرایند ضمانت، وضعیت اعتباری شما بررسی می‌شود. این
            اعتبارسنجی برای ضامن هزینه پرداختی ندارد و فقط برای تکمیل پرونده
            ضمانت انجام می‌شود.
          </p>
          {requestId && (
            <p className="mt-2 text-xs font-medium text-gray-500" dir="ltr">
              {requestId}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <BadgeCheck size={18} className="text-emerald-600" />
            هزینه اعتبارسنجی
          </span>
          <span className="font-bold text-emerald-600">رایگان</span>
        </div>

        <div className="flex items-start gap-2 text-xs leading-6 text-gray-500">
          <MessageSquareText
            size={16}
            className="mt-1 shrink-0 text-blue-600"
          />
          <span>
            با انتخاب ادامه، کد تایید اعتبارسنجی برای شما ارسال می‌شود.
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        className="inline-flex items-center justify-center gap-2"
        disabled={loading}
        onClick={handleContinue}
      >
        {loading ? "در حال ارسال..." : "ادامه"}
        {!loading && <ArrowLeft size={18} />}
      </Button>
    </Card>
  );
}

function GuarantorCreditCode({
  requestId,
  loading,
  onContinue,
  onResend,
  resending,
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const handleCodeChange = (event) => {
    setError("");
    setCode(event.target.value.replace(/\D/g, "").slice(0, 8));
  };

  const handleContinue = () => {
    if (!code) {
      setError("کد تایید را وارد کنید.");
      return;
    }

    setError("");
    onContinue?.({ code, onError: setError });
  };

  const handleResend = () => {
    setResendMessage("");
    onResend?.({ onError: setResendMessage });
  };

  return (
    <Card className="mt-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MessageSquareText size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900">کد اعتبارسنجی</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            کد تایید ارسال شده را وارد کنید تا اعتبارسنجی ضامن ثبت شود.
          </p>
          {requestId && (
            <p className="mt-2 text-xs font-medium text-gray-500" dir="ltr">
              {requestId}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <Input
          dir="ltr"
          disabled={loading}
          error={error}
          inputMode="numeric"
          label="کد تایید"
          onChange={handleCodeChange}
          placeholder="کد پیامک شده"
          value={code}
        />

        <Button
          className="inline-flex items-center justify-center gap-2"
          disabled={loading || !code}
          onClick={handleContinue}
        >
          {loading ? "در حال بررسی..." : "ادامه"}
          {!loading && <ArrowLeft size={18} />}
        </Button>

        {resendMessage && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {resendMessage}
          </p>
        )}

        <Button
          className="mt-3"
          disabled={resending}
          onClick={handleResend}
          variant="secondary"
        >
          {resending ? "در حال ارسال..." : "ارسال مجدد"}
        </Button>
      </div>
    </Card>
  );
}

function GuarantorCreditResult({ requestId }) {
  const getGuarantorScoreResult = useGetGuarantorScoreResult(requestId);
  const result = getResultData(getGuarantorScoreResult.data);
  const loading = getGuarantorScoreResult.isPending;
  const error = getGuarantorScoreResult.error;
  const score = result?.score || result?.grade || result?.credit_score || result?.result;
  const status = result?.status || result?.state;
  const description = result?.description || result?.message || result?.risk_title;

  return (
    <Card className="mt-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BadgeCheck size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900">
            نتیجه اعتبارسنجی
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            نتیجه اعتبارسنجی ضامن پس از تکمیل فرایند در این بخش نمایش داده
            می‌شود.
          </p>
          {requestId && (
            <p className="mt-2 text-xs font-medium text-gray-500" dir="ltr">
              {requestId}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          در حال دریافت نتیجه اعتبارسنجی...
        </p>
      )}

      {!loading && error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {getApiErrorMessage(error, "دریافت نتیجه اعتبارسنجی ناموفق بود.")}
        </p>
      )}

      {!loading && !error && result && (
        <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          {score && (
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">نتیجه اعتبارسنجی</span>
              <span className="font-bold text-blue-600">{score}</span>
            </div>
          )}

          {status && (
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">وضعیت</span>
              <span className="font-bold text-emerald-600">{status}</span>
            </div>
          )}

          {description && (
            <p className="text-sm leading-6 text-gray-500">{description}</p>
          )}
        </div>
      )}
    </Card>
  );
}

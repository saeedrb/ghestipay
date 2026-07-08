"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import CreditScoreIntro from "../CreditScore/Intro";
import Button from "@/shared/components/ui/Button";
import { useInstallment } from "@/shared/hooks/useInstallment";

function getApiErrorMessage(error) {
  return (
    error?.data?.message ||
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "ارسال کد اعتبارسنجی ناموفق بود. لطفا دوباره تلاش کنید."
  );
}

function getResponseData(response) {
  return response?.data || response || null;
}

function getRequestId(requestData) {
  return (
    requestData?.id ||
    requestData?.tracking_code ||
    requestData?.guarantor_tracking_code ||
    requestData?.guarantor?.id ||
    requestData?.guarantor?.tracking_code ||
    ""
  );
}

const GuarantorCreditScoreIntro = ({ requestData, refetch }) => {
  const { getVerifyCodeForGuarantorCreditScore } = useInstallment();
  const [errorMessage, setErrorMessage] = useState("");
  const requestId = getRequestId(requestData);

  const handleContinue = () => {
    if (!requestId) {
      setErrorMessage("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    setErrorMessage("");
    getVerifyCodeForGuarantorCreditScore.mutate(
      { requestId },
      {
        onSuccess: (res) => {
          const responseData = getResponseData(res);

          if (responseData?.success === false) {
            setErrorMessage(
              responseData?.message ||
                "ارسال کد اعتبارسنجی ناموفق بود. لطفا دوباره تلاش کنید.",
            );
            return;
          }

          refetch?.();
        },
        onError: (error) => {
          setErrorMessage(getApiErrorMessage(error));
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <CreditScoreIntro amount={0} finalAmount={0} displayFinalAmount={0} />

      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <Button
        className="inline-flex items-center justify-center gap-2"
        disabled={getVerifyCodeForGuarantorCreditScore.isPending || !requestId}
        onClick={handleContinue}
      >
        {getVerifyCodeForGuarantorCreditScore.isPending
          ? "در حال ارسال..."
          : "ادامه"}
        {!getVerifyCodeForGuarantorCreditScore.isPending && (
          <ArrowLeft size={18} />
        )}
      </Button>
    </div>
  );
};

export default GuarantorCreditScoreIntro;

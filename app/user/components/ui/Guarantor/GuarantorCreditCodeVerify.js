"use client";

import { useState } from "react";
import CreditCode from "../CreditScore/CreditCode";
import { useInstallment } from "@/shared/hooks/useInstallment";

function getApiErrorMessage(error, fallback) {
  return (
    error?.data?.message ||
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
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

const GuarantorCreditCodeVerify = ({ requestData, refetch }) => {
  const {
    verifyGuarantorCreditScore,
    ResendVerifyCodeForGuarantorCreditScore,
  } = useInstallment();
  const [errorMessage, setErrorMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const requestId = getRequestId(requestData);

  const handleSubmitCode = (code) => {
    if (!requestId) {
      setErrorMessage("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    setErrorMessage("");
    verifyGuarantorCreditScore.mutate(
      { requestId, code },
      {
        onSuccess: (res) => {
          const responseData = getResponseData(res);

          if (responseData?.success === false) {
            setErrorMessage(
              responseData?.message || "کد وارد شده معتبر نیست.",
            );
            return;
          }

          refetch?.();
        },
        onError: (error) => {
          setErrorMessage(
            getApiErrorMessage(error, "کد وارد شده معتبر نیست."),
          );
        },
      },
    );
  };

  const handleRequestCode = () => {
    if (!requestId) {
      setResendMessage("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    setResendMessage("");
    ResendVerifyCodeForGuarantorCreditScore.mutate(
      { requestId },
      {
        onSuccess: (res) => {
          const responseData = getResponseData(res);

          if (responseData?.success === false) {
            setResendMessage(
              responseData?.message || "ارسال مجدد کد ناموفق بود.",
            );
            return;
          }

          setResendMessage("کد اعتبارسنجی دوباره ارسال شد.");
        },
        onError: (error) => {
          setResendMessage(
            getApiErrorMessage(error, "ارسال مجدد کد ناموفق بود."),
          );
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <CreditCode
        onRequestCode={handleRequestCode}
        onSubmitCode={handleSubmitCode}
        requesting={ResendVerifyCodeForGuarantorCreditScore.isPending}
        submitting={verifyGuarantorCreditScore.isPending}
      />

      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      {resendMessage && (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600">
          {resendMessage}
        </p>
      )}
    </div>
  );
};

export default GuarantorCreditCodeVerify;

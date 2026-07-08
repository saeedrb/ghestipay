"use client";

import { useState } from "react";
import { useGuarantor } from "@/shared/hooks/useGuarantor";
import CreditScoreResult from "../CreditScore/Result";
import { useGetGuarantorScoreResult } from "@/shared/hooks/useInstallment";
import Button from "@/shared/components/ui/Button";

function getResponseData(response) {
  return response?.data?.data || response?.data || response || null;
}

function getResponseRoot(response) {
  return response?.data || response || null;
}

function getApiErrorMessage(error) {
  return (
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "دریافت نتیجه اعتبارسنجی ناموفق بود."
  );
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

const GuarantorCreditScoreResult = ({ requestData, refetch }) => {
  const isCompleted = requestData?.guarantor_status === "credit_score_completed";
  const requestId = getRequestId(requestData);
  const [evaluateMessage, setEvaluateMessage] = useState("");
  const [evaluateStatus, setEvaluateStatus] = useState("");
  const getGuarantorScoreResult = useGetGuarantorScoreResult(requestId, {
    enabled: isCompleted && Boolean(requestId),
  });
  const { evaluateGuarantor } = useGuarantor();

  const handleEvaluate = () => {
    if (!requestId) {
      setEvaluateStatus("error");
      setEvaluateMessage("شناسه درخواست ضمانت پیدا نشد.");
      return;
    }

    setEvaluateStatus("");
    setEvaluateMessage("");
    evaluateGuarantor.mutate(requestId, {
      onSuccess: (res) => {
        const responseRoot = getResponseRoot(res);

        if (responseRoot?.success === false) {
          setEvaluateStatus("error");
          setEvaluateMessage(
            responseRoot?.message || "بررسی ضامن ناموفق بود.",
          );
          return;
        }

        setEvaluateStatus("success");
        setEvaluateMessage(responseRoot?.message || "ضامن با موفقیت تایید شد.");
        refetch?.();
      },
      onError: (error) => {
        setEvaluateStatus("error");
        setEvaluateMessage(getApiErrorMessage(error));
      },
    });
  };

  if (!isCompleted) {
    return <CreditScoreResult status="pending" />;
  }

  if (getGuarantorScoreResult.isPending) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-medium text-slate-600">
        در حال دریافت نتیجه اعتبارسنجی...
      </div>
    );
  }

  if (getGuarantorScoreResult.isError) {
    return (
      <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
        {getApiErrorMessage(getGuarantorScoreResult.error)}
      </div>
    );
  }

  const responseData = getResponseData(getGuarantorScoreResult.data);
  const resultData = responseData?.report || responseData || null;

  return (
    <div className="space-y-4">
      <CreditScoreResult
        status="ready"
        score={resultData?.credit_score?.risk_grade || resultData?.score}
        reportDate={resultData?.checked_at || resultData?.created_at}
        riskTitle={
          resultData?.final_analysis?.risk_level || resultData?.risk_title
        }
        checksSummaryValue={
          resultData?.checks?.summary || resultData?.checks_summary
        }
        loanSummary={resultData?.facilities?.received || resultData?.loan_summary}
        loanGuarantedSummary={
          resultData?.facilities?.guaranteed ||
          resultData?.loan_guaranteed_summary
        }
      />

      {evaluateMessage && (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            evaluateStatus === "success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {evaluateMessage}
        </p>
      )}

      <Button
        disabled={evaluateGuarantor.isPending || !requestId}
        onClick={handleEvaluate}
      >
        {evaluateGuarantor.isPending ? "در حال بررسی..." : "بررسی"}
      </Button>
    </div>
  );
};

export default GuarantorCreditScoreResult;

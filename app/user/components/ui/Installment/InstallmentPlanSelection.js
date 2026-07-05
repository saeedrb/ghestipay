import PaymentInfo from "../Request/PaymentInfo";
import Loading from "@/shared/components/ui/Loading";
import { useGetEvaluateRules } from "@/shared/hooks/useInstallment";
import { useState } from "react";

const InstallmentPlanSelection = ({ orderDetails, refetchRequest }) => {
  const trackingId =
    orderDetails?.tracking_id ||
    orderDetails?.trackingId ||
    orderDetails?.tracking_code;

  const {
    data: evaluateRulesResponse,
    isLoading,
    isError,
  } = useGetEvaluateRules(trackingId, {
    enabled: Boolean(trackingId),
  });

  const evaluateRulesData =
    evaluateRulesResponse?.data?.data || evaluateRulesResponse?.data || null;

  if (isLoading) {
    return <Loading message="در حال دریافت قوانین و شرایط پرداخت..." />;
  }

  if (isError) {
    return null;
  }

  return (
    <div>
      <PaymentInfo
        trackingId={trackingId}
        orderDetails={orderDetails}
        evaluateRulesData={evaluateRulesData}
      />
    </div>
  );
};

export default InstallmentPlanSelection;

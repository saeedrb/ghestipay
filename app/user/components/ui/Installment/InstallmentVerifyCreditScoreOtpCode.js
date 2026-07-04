import React from "react";
import CreditCode from "../CreditScore/CreditCode";
import { useCredit } from "@/shared/hooks/useCredit";

const InstallmentVerifyCreditScoreOtpCode = ({ orderDetails, refetchRequest }) => {
  const {
    verifyCreditCode: {
      mutate: verifyCreditCode,
      isPending: isVerifyingCreditCode,
    },
    ResendVerifycodeForInstallmentRequest: {
      mutate: resendVerifyCodeForCreditScore,
      isPending: isResendingVerifyCode,
    },
  } = useCredit();

  const trackingId =
    orderDetails?.tracking_id ||
    orderDetails?.trackingId ||
    orderDetails?.tracking_code;

  const canResendAfter =
    orderDetails?.can_resend_after ||
    orderDetails?.canResendAfter ||
    orderDetails?.data?.can_resend_after ||
    orderDetails?.data?.canResendAfter;

  return (
    <CreditCode
      phone={orderDetails?.phone || orderDetails?.mobile || orderDetails?.mobile_number}
      onRequestCode={() => {
        if (!trackingId) return;

        resendVerifyCodeForCreditScore(
          { requestId: trackingId },
          {
            onSuccess: () => refetchRequest?.(),
          },
        );
      }}
      onSubmitCode={(code) => {
        if (!trackingId) return;

        verifyCreditCode(
          { trackingId, code },
          {
            onSuccess: () => refetchRequest?.(),
          },
        );
      }}
      canResendAfter={canResendAfter}
      requesting={isResendingVerifyCode}
      submitting={isVerifyingCreditCode}
    />
  );
};

export default InstallmentVerifyCreditScoreOtpCode;

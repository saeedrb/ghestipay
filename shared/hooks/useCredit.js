import { useMutation } from "@tanstack/react-query";
import { creditService } from "../services/credit.service";
import { installmentService } from "../services/installment.service";
import { useCreditStore } from "../stores/credit.store";

function extractCreditRequest(res) {
  return res?.data?.data?.[0] || res?.data?.data || null;
}

export function useCredit() {
  const setCreditRequest = useCreditStore((s) => s.setCreditRequest);

  const updateCreditStore = (res) => {
    const request = extractCreditRequest(res);
    const message = res?.data?.message || "";

    if (request) {
      setCreditRequest({ request, message });
    }
  };

  const getLatestCreditScore = useMutation({
    mutationFn: () => creditService.latest(),
    onSuccess: updateCreditStore,
  });

  const createCreditScore = useMutation({
    mutationFn: () => creditService.create(),
    onSuccess: updateCreditStore,
  });

  const resetCreditScoreRequests = useMutation({
    mutationFn: () => creditService.newRequest(),
  });

  const getCreditScoreDetails = useMutation({
    mutationFn: (creditInquiryId) => creditService.details(creditInquiryId),
    onSuccess: updateCreditStore,
  });

  const sendVerificationCode = useMutation({
    mutationFn: (creditInquiryId) => creditService.sendVerificationCode(),
    onSuccess: updateCreditStore,
  });

  const verifyCode = useMutation({
    mutationFn: ({ creditInquiryId, code }) =>
      creditService.verifyCode({ creditInquiryId, code }),
    onSuccess: updateCreditStore,
  });

  const generateCreditScoreResult = useMutation({
    mutationFn: (creditInquiryId) => creditService.result(creditInquiryId),
    onSuccess: updateCreditStore,
  });

  const startCreditScoreResultGeneration = useMutation({
    mutationFn: (orderTrakingId) =>
      creditService.startCreditScoreResultGeneration(orderTrakingId),
  });

  const verifyCreditCode = useMutation({
    mutationFn: ({ trackingId, code }) =>
      creditService.verifyCreditCode({ trackingId, code }),
  });

  const creditScoreResult = useMutation({
    mutationFn: (trakingId) => {
      return creditService.creditScoreResult(trakingId);
    }
  });
  const ResendVerifycodeForInstallmentRequest = useMutation({
    mutationFn: ({ requestId }) =>
      creditService.resendOtpCodeForInstallmentCreditScore(requestId)
  });
  const ResendVerifyCodeForCreditScore = useMutation({
    mutationFn: ({ requestId }) =>
      installmentService.resendVerifyCodeForGuarantorCreditScore(requestId),
  });

  return {
    getLatestCreditScore,
    createCreditScore,
    resetCreditScoreRequests,
    getCreditScoreDetails,
    sendVerificationCode,
    verifyCode,
    generateCreditScoreResult,
    startCreditScoreResultGeneration,
    verifyCreditCode,
    creditScoreResult,
    ResendVerifyCodeForCreditScore,
    ResendVerifycodeForInstallmentRequest
  };
}

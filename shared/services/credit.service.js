import client from "../api/client";

export const creditService = {
  create() {
    return client.post("/api/kyc/credit-score/create");
  },

  newRequest() {
    return client.post("/api/kyc/credit-score/reset");
  },

  latest() {
    return client.get("/api/kyc/credit-score/latest");
  },

  details(creditInquiryId) {
    return client.get(`/api/kyc/credit-score/${creditInquiryId}`);
  },

  sendVerificationCode() {
    return client.post(`/api/kyc/credit-score/request-code`);
  },

  verifyCode({ creditInquiryId, code }) {
    return client.post(`/api/kyc/credit-score/verify`, {
      code,
    });
  },

  result(creditInquiryId) {
    return client.get(`/api/kyc/credit-score/${creditInquiryId}/result`);
  },




  startCreditScoreResultGeneration(orderTrakingId) {
    return client.post(`/v1/installment-requests/${orderTrakingId}/credit-score/start`);
  },
  verifyCreditCode({ trackingId, code }) {
    return client.post(`/v1/installment-requests/${trackingId}/credit-score/verify-otp`, {
      otp: code
    });
  },
  creditScoreResult(trackingId) {
    return client.post(`/v1/installment-requests/${trackingId}/credit-score/result`);
  },
  resendOtpCodeForInstallmentCreditScore (trakingId) {
    return client.post(`/v1/installment-requests/${trakingId}/credit-score/resend-otp`)
  }
  
};

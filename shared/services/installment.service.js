import client from "../api/client";

export const installmentService = {
  async storeOrder({ phone, invoice_id }) {
    const res = await client.post(
      "/api/installments/v2/purchase-requests",
      {
        phone,
        invoice_id,
      },
      {
        skipAuthRedirect: true,
      },
    );

    if (res?.data?.success === false || res?.data?.status === false) {
      throw {
        response: {
          data: res.data,
        },
      };
    }

    return res;
  },

  async getOrderList(options) {
    return client.get("/v1/installment-requests", { params: options });
  },
  async getOrderDetails(orderId) {
    return client.get(`/v1/installment-requests/${orderId}`);
  },

  async getOrderProgressDetails(orderId) {
    return client.get(`/v1/installment-requests/${orderId}/progress`);
  },

  async getEvaluateRules(trackingId) {
    return client.post(`/v1/installment-requests/${trackingId}/rules/evaluate`);
  },

  async setPaymentPlan({
    trackingId,
    down_payment_amount,
    months,
    check_interval_months,
  }) {
    return client.post(`/v1/installment-requests/${trackingId}/plans/select`, {
      down_payment_amount,
      check_interval_months,
      months,
    });
  },

  async removePaymentPlan({ trackingId, planId }) {
    return client.post(
      `/v1/installment-requests/${trackingId}/plans/${planId}/cancel`,
      {},
    );
  },

  async getPaymentInformation({ trackingId, planId }) {
    // return false;
    return client.post(
      `/v1/installment-requests/${trackingId}/plans/${planId}/pay`,
    );
  },

  async setGuarantor({ trackingId, guarantor }) {
    return client.post(`/v1/installment-requests/${trackingId}/guarantors`, {
      ...guarantor,
    });
  },

  async getGuaranteeRequests(options) {
    return client.get("/v1/guarantors/my-requests", { params: options });
  },

  async rejectGuaranteeRequest(requestId) {
    return client.post(`/v1/guarantors/requests/${requestId}/reject`);
  },
  async acceptGuaranteeRequest(requestId) {
    return client.post(`/v1/guarantors/requests/${requestId}/accept`);
  },
  async getVerifyCodeForGuarantorCreditScore(requestId) {
    return client.post(
      `/v1/guarantors/requests/${requestId}/credit-score/start`,
    );
  },
  async verifyGuarantorCreditScore({ requestId, code }) {
    return client.post(
      `/v1/guarantors/requests/${requestId}/credit-score/verify-otp`,
      {
        otp: code,
      },
    );
  },
  async getGuarantorScoreResult(requestId) {
    return client.get(
      `/v1/guarantors/requests/${requestId}/credit-score/result`,
    );
  },
  async resendVerifyCodeForGuarantorCreditScore(requestId) {
    return client.post(
      `/v1/guarantors/requests/${requestId}/credit-score/resend-otp`,
    );
  },

  async evaluateGuarantorRules(requestId) {
    return client.post(`/v1/guarantors/requests/${requestId}/rules/evaluate`);
  },
};

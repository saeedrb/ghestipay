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
      }
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
    return client.get("/v1/installment-requests", options);
  },
  async getOrderDetails(orderId) {
    return client.get(`/v1/installment-requests/${orderId}`); 
  },

  async getOrderProgressDetails(orderId) {
    return client.get(`/v1/installment-requests/${orderId}/progress`);
  },

  async getEvaluateRules(trackingId) {
    return client.post(`/v1/installment-requests/${trackingId}/rules/evaluate`)
  },

  async setPaymentPlan({trackingId, down_payment_amount, months, check_interval_months }) {
    return client.post(`/v1/installment-requests/${trackingId}/plans/select`, {
      down_payment_amount,
      check_interval_months,
      months
    })
  },

  async removePaymentPlan({trackingId, planId}) {
    return client.post(
      `/v1/installment-requests/${trackingId}/plans/${planId}/cancel`,
      {}
    );
  } 
};

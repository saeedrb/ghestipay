import client from "../api/client";

export const gurantorServices = {
      async getGuarantorProgress(requestId, options = {}) {
    return client.get(`/v1/guarantors/requests/${requestId}/progress`, { params: options });
  },
}
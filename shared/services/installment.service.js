import client from "../api/client";

export const installmentService = {
  async storeOrder({ phone, invoice_id }) {
    const res = await client.post(
      "/api/installments/store-orders",
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
    return client.get("/api/installments/requests", options);
  }
};

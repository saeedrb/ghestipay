import { create } from "zustand";

export const useInstallmentStore = create((set) => ({
  orderDetails: null,
  paymentPlan: null,

  setOrderDetails: (orderDetails) => {
    set({ orderDetails: orderDetails[0] });
  },

  setPaymentPlan: (paymentPlan) => {
    set({ paymentPlan });
  },

  clearOrderDetails: () => {
    set({ orderDetails: null });
  },

  clearPaymentPlan: () => {
    set({ paymentPlan: null });
  },
}));

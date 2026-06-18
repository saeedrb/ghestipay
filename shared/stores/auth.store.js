import { create } from "zustand";
import Cookies from "js-cookie";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  hydrated: false,
  lading: false,

  setAuth: (data) => {
    set({
      user: data.user,
      token: data.token,
      hydrated: true,
    });

    Cookies.set("token", data.token);
    Cookies.set("user", JSON.stringify(data.user));
  },
  updateUser: (user) => {
    set({ user });
    Cookies.set("user", JSON.stringify(user));
  },
  hydrate: () => {
    const token = Cookies.get("token");
    const userStr = Cookies.get("user");
    
    if (token) {
      set({ token });
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user });
      } catch (e) {
        Cookies.remove("user");
      }
    }
    
    // mark that hydration has completed (even if no token)
    set({ hydrated: true });
  },
  logout: () => {
    set({ user: null, token: null });
    Cookies.remove("token");
  },
}));
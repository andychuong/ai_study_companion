import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import { authApi, LoginData, RegisterData } from "@/lib/api/auth";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (data: LoginData) => {
        const response = await authApi.login(data);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
        });
        // Also store in localStorage for API client
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.data.token);
          localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        }
      },

      register: async (data: RegisterData) => {
        const response = await authApi.register(data);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
        });
        // Also store in localStorage for API client
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.data.token);
          localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      },

      updateUser: (user: User) => {
        set({ user });
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(user));
        }
      },

      initialize: async () => {
        try {
          // First check Zustand persisted state
          const persistedState = get();
          let token = persistedState.token;
          let user = persistedState.user;

          // Fallback to localStorage if Zustand state is empty
          if (!token && typeof window !== "undefined") {
            token = localStorage.getItem("auth_token");
            const userStr = localStorage.getItem("auth_user");
            if (userStr) {
              try {
                user = JSON.parse(userStr);
              } catch (e) {
                // Invalid user data, ignore
              }
            }
          }

          if (token) {
            // Verify token is still valid by fetching current user
            try {
              const response = await authApi.getCurrentUser();
              set({
                user: response.data,
                token,
                isAuthenticated: true,
              });
              // Update localStorage
              if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", token);
                localStorage.setItem("auth_user", JSON.stringify(response.data));
              }
            } catch (error) {
              // Token invalid or expired, clear auth
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              });
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
              }
            }
          }
        } catch (error) {
          // Error during initialization, clear auth
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined as any)),
      skipHydration: false, // Enable hydration to restore state on page load
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


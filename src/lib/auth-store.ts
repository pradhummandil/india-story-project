import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

export type UserProfileData = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthState = {
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  loading: boolean;
  initialized: boolean;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  setSession: async (session) => {
    if (!session) {
      set({
        session: null,
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
      return;
    }

    set({ session, user: session.user, loading: true });

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const { profile } = await res.json();
        set({ profile, loading: false, initialized: true });
      } else {
        set({ profile: null, loading: false, initialized: true });
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
      set({ profile: null, loading: false, initialized: true });
    }
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut().catch((err) => console.error("SignOut error:", err));
    set({ user: null, session: null, profile: null, loading: false });
  },
}));

/** Call once at app root to subscribe to auth state changes. */
export function initAuthListener() {
  if (typeof window === "undefined") return () => {};

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });

  // Listen for auth changes (sign in, sign out, token refresh)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });

  return () => subscription.unsubscribe();
}

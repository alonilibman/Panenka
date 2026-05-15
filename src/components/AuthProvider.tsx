"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // This starts the listener when the app mounts
    const unsubscribe = initAuth();
    
    // This cleans it up when the app unmounts, preventing the CPU crash!
    return () => unsubscribe();
  }, [initAuth]);

  return <>{children}</>;
}
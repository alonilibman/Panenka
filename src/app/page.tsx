"use client";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-7xl font-black tracking-tighter italic">
          PANENKA
        </h1>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-2xl font-medium">
              Welcome back, <span className="text-blue-600">{user.displayName}</span>! ⚽
            </p>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-6">Your squad is empty. Ready to scout some talent?</p>
              <Link 
                href="/database"
                className="inline-block bg-black text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Start Building
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-xl text-gray-600">
              The ultimate World Cup fantasy experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/login"
                className="inline-block bg-black text-white px-12 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg"
              >
                Enter the Arena
              </Link>
              <Link 
                href="/database"
                className="inline-block bg-white text-black border-2 border-gray-200 px-12 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                Scout Database
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
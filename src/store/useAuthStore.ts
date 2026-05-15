import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Updated import

const googleProvider = new GoogleAuthProvider();

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  login: async () => {
    await signInWithPopup(auth, googleProvider);
  },
  logout: async () => {
    await signOut(auth);
  },
  initAuth: () => {
    return onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  }
}));
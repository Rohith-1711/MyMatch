import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  bio?: string;
  intent: 'dating' | 'platonic' | 'both';
  general_location?: string;
  is_precise_location_opted_in: boolean;
  photos: string[];

  // Module 2 Additions
  dob?: string;
  sex?: string;
  sexuality?: string;
  height?: number;
  drinking_habit?: string;
  smoking_habit?: string;
  weed_usage?: string;
  drug_usage?: string;
  religion?: string;
  hometown?: string;
  occupation?: string;
  sports?: string[];
  hobbies?: string[];
  is_profile_completed?: boolean;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitialized: (isInitialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isInitialized: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}));

import { create } from 'zustand';
import { User } from '../models/User';

// Manage State

export const useUserStore = create((set) => ({
  currentUser: new User({}),
  setCurrentUser: (userData) =>
    set((state) => ({
      currentUser: {
        ...state.user,
        ...userData,
      },
    })),
}));

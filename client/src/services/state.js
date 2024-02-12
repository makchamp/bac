import { create } from 'zustand';
import { User } from '../models/User';

// State Management

export const useUserStore = create((set) => ({
  user: new User({}),
  setUser: (newUser) =>
    set((state) => ({
      user: {
        ...state.user,
        ...newUser,
      },
    })),
}));

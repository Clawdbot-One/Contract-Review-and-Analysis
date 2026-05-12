import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
  } | null;
  token: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        status: string;
      };
      token: string;
    }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action: PayloadAction<{
      username?: string;
      email?: string;
      role?: string;
      status?: string;
    }>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const { loginSuccess, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import contractReducer from './contractSlice';
import approvalReducer from './approvalSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    contract: contractReducer,
    approval: approvalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
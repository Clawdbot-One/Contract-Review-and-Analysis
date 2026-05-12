import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Approval {
  id: string;
  contract_id: string;
  approver_id: string;
  status: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface ApprovalState {
  approvals: Approval[];
  currentApproval: Approval | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApprovalState = {
  approvals: [],
  currentApproval: null,
  loading: false,
  error: null,
};

const approvalSlice = createSlice({
  name: 'approval',
  initialState,
  reducers: {
    setApprovals: (state, action: PayloadAction<Approval[]>) => {
      state.approvals = action.payload;
    },
    setCurrentApproval: (state, action: PayloadAction<Approval>) => {
      state.currentApproval = action.payload;
    },
    addApproval: (state, action: PayloadAction<Approval>) => {
      state.approvals.push(action.payload);
    },
    updateApproval: (state, action: PayloadAction<Approval>) => {
      const index = state.approvals.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.approvals[index] = action.payload;
      }
      if (state.currentApproval && state.currentApproval.id === action.payload.id) {
        state.currentApproval = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setApprovals, setCurrentApproval, addApproval, updateApproval, setLoading, setError } = approvalSlice.actions;
export default approvalSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Contract {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  uploader_id: string;
  file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ContractState {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContractState = {
  contracts: [],
  currentContract: null,
  loading: false,
  error: null,
};

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setContracts: (state, action: PayloadAction<Contract[]>) => {
      state.contracts = action.payload;
    },
    setCurrentContract: (state, action: PayloadAction<Contract>) => {
      state.currentContract = action.payload;
    },
    addContract: (state, action: PayloadAction<Contract>) => {
      state.contracts.push(action.payload);
    },
    updateContract: (state, action: PayloadAction<Contract>) => {
      const index = state.contracts.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
      if (state.currentContract && state.currentContract.id === action.payload.id) {
        state.currentContract = action.payload;
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

export const { setContracts, setCurrentContract, addContract, updateContract, setLoading, setError } = contractSlice.actions;
export default contractSlice.reducer;
import api from './api';

interface ContractData {
  title: string;
  category: string;
  subcategory: string;
  description?: string;
}

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

interface UploadResponse {
  message: string;
  contract: Contract;
}

interface ContractsResponse {
  contracts: Contract[];
}

export const contractService = {
  uploadContract: async (formData: FormData): Promise<UploadResponse> => {
    return api.post('/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getContracts: async (params?: {
    status?: string;
    category?: string;
    subcategory?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ContractsResponse> => {
    return api.get('/contracts', { params });
  },
  getContractById: async (contractId: string) => {
    return api.get(`/contracts/${contractId}`);
  },
  updateContract: async (contractId: string, data: Partial<ContractData>) => {
    return api.put(`/contracts/${contractId}`, data);
  },
  deleteContract: async (contractId: string) => {
    return api.delete(`/contracts/${contractId}`);
  },
  getAuditReport: async (contractId: string) => {
    return api.get(`/contracts/${contractId}/audit-report`);
  },
};
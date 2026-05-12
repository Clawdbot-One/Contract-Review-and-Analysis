import api from './api';

interface ApprovalData {
  contract_id: string;
  status: string;
  comment: string;
}



export const approvalService = {
  getMyApprovals: async () => {
    return api.get('/approvals/my');
  },
  getApprovalById: async (approvalId: string) => {
    return api.get(`/approvals/${approvalId}`);
  },
  createApproval: async (data: ApprovalData) => {
    return api.post('/approvals', data);
  },
  updateApproval: async (approvalId: string, data: Partial<ApprovalData>) => {
    return api.put(`/approvals/${approvalId}`, data);
  },
  getContractApprovals: async (contractId: string) => {
    return api.get(`/contracts/${contractId}/approvals`);
  },
};
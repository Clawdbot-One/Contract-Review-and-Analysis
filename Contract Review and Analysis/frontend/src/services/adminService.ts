import api from './api';

export const adminService = {
  getStats: async () => {
    return api.get('/admin/stats');
  },
  getSystemInfo: async () => {
    return api.get('/admin/system');
  },
  getRules: async () => {
    return api.get('/admin/rules');
  },
  createRule: async (data: { category: string; subcategory: string; rule_name: string; rule_content: string }) => {
    return api.post('/admin/rules', data);
  },
  updateRule: async (ruleId: string, data: { category: string; subcategory: string; rule_name: string; rule_content: string }) => {
    return api.put(`/admin/rules/${ruleId}`, data);
  },
  deleteRule: async (ruleId: string) => {
    return api.delete(`/admin/rules/${ruleId}`);
  },
};

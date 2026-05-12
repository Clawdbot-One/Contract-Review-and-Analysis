import api from './api';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  department: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
  };
  token: string;
}

export const userService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    return api.post('/auth/login', data);
  },
  register: async (data: RegisterData) => {
    return api.post('/auth/register', data);
  },
  getCurrentUser: async (): Promise<{ user: User }> => {
    return api.get('/users/me');
  },
  getUsers: async () => {
    return api.get('/users');
  },
  approveUser: async (userId: string) => {
    return api.put(`/users/${userId}/approve`);
  },
  updateUser: async (userId: string, data: Partial<User>) => {
    return api.put(`/users/${userId}`, data);
  },
  deleteUser: async (userId: string) => {
    return api.delete(`/users/${userId}`);
  },
};
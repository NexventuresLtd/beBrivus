import apiClient, { tokenManager } from './client';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'graduate' | 'mentor' | 'admin' | 'institution';
  profile_picture?: string;
  bio?: string;
  location?: string;
  phone_number?: string;
  date_of_birth?: string;
  university?: string;
  field_of_study?: string;
  graduation_year?: number;
  linkedin_profile?: string;
  github_profile?: string;
  portfolio_website?: string;
  profile_public: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_active: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  user_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', data);
    const { user, access, refresh } = response.data;
    tokenManager.setTokens(access, refresh);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', data);
    const { user, access, refresh } = response.data;
    tokenManager.setTokens(access, refresh);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout/', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    tokenManager.clearTokens();
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch('/auth/profile/', data);
    return response.data;
  },

  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = tokenManager.getRefreshToken();
    const response = await apiClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authApi;

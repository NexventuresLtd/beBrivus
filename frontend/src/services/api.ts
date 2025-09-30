import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: 'http://127.0.0.1:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url: string, config?: AxiosRequestConfig) {
    return this.instance.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post(url, data, config);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.patch(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config);
  }
}

export const api = new ApiService();

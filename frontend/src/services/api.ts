import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token and user ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    console.log('API Request:', {
      url: config.url,
      userId: userId || 'MISSING',
      hasToken: !!token
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userId && userId !== 'undefined') {
      config.headers['x-user-id'] = userId;
    } else {
      console.warn('userId is missing or undefined in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
};

export const chatApi = {
  createChat: (data: any) => api.post('/chats', data),
  startChat: (data: { content: string; projectId?: string }) => api.post('/chats/start', data),
  getChats: () => api.get('/chats'),
  getChat: (chatId: string) => api.get(`/chats/${chatId}`),
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (data: any) => api.post('/chats/messages', data),
  clearHistory: () => api.delete('/chats/history'), // Assuming endpoint exists or will be added
};

export const projectApi = {
  getProjects: () => api.get('/projects'),
  createProject: (data: { name: string; systemPrompt: string }) => api.post('/projects', data),
};

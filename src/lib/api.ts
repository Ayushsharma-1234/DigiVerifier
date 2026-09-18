import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  }
};

export const instruments = {
  getAll: async () => {
    const res = await api.get('/instruments');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/instruments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/instruments', data);
    return res.data;
  },
  getHistory: async (id: string) => {
    const res = await api.get(`/instruments/${id}/history`);
    return res.data;
  }
};

export const applications = {
  getAll: async (filters?: any) => {
    const res = await api.get('/applications', { params: filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/applications', data);
    return res.data;
  },
  pay: async (id: string) => {
    const res = await api.patch(`/applications/${id}/pay`);
    return res.data;
  },
  schedule: async (id: string, date: string) => {
    const res = await api.patch(`/applications/${id}/schedule`, { date });
    return res.data;
  },
  inspect: async (id: string, data: any) => {
    const res = await api.post(`/applications/${id}/inspect`, data);
    return res.data;
  }
};

export const certificates = {
  getAll: async () => {
    const res = await api.get('/certificates');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/certificates/${id}`);
    return res.data;
  },
  downloadPDF: async (id: string) => {
    const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
    return res.data;
  }
};

export const dashboard = {
  getApplicantStats: async () => {
    const res = await api.get('/dashboard/applicant');
    return res.data;
  },
  getLMOStats: async () => {
    const res = await api.get('/dashboard/lmo');
    return res.data;
  },
  getAdminStats: async (state?: string, district?: string) => {
    const res = await api.get('/dashboard/admin', { params: { state, district } });
    return res.data;
  }
};

export const publicApi = {
  verifyCertificate: async (certificateId: string) => {
    const res = await api.get(`/verify/${certificateId}`);
    return res.data;
  }
};

export default api;

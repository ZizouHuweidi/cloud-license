import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { api } from '@/client/api';
import { Device, DeviceStats } from '../types';

interface DevicesResponse {
  data: Device[];
  count: number;
}

export const useDeviceStats = () => {
  return useQuery<AxiosResponse<DeviceStats>>({  
    queryKey: ['deviceStats'],
    queryFn: () => api.get('/api/devices/stats')
  });
};

export const useDevices = (page = 1, limit = 10) => {
  return useQuery<AxiosResponse<DevicesResponse>>({
    queryKey: ['devices', page],
    queryFn: () => api.get(`/api/devices?skip=${(page - 1) * limit}&limit=${limit}`)
  });
};

export const useDevice = (id: string) => {
  return useQuery<AxiosResponse<Device>>({
    queryKey: ['device', id],
    queryFn: () => api.get(`/api/devices/${id}`),
    enabled: !!id,
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<Device>, Error, Partial<Device>, unknown>({
    mutationFn: (device: Partial<Device>) => api.post('/api/devices', device),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['deviceStats'] });
    },
  });
};

export const useUpdateDevice = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<Device>, Error, Partial<Device>, unknown>({
    mutationFn: (device: Partial<Device>) => api.put(`/api/devices/${id}`, device),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      queryClient.invalidateQueries({ queryKey: ['deviceStats'] });
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<void>, Error, string, unknown>({
    mutationFn: (id: string) => api.delete(`/api/devices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

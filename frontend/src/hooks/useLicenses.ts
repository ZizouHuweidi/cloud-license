import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { api } from '@/client/api';
import { License, ExpiringLicense, LicenseStats, Device } from '../types';

interface LicensesResponse {
  data: License[];
  count: number;
}

export const useLicenses = (page = 1, limit = 10) => {
  return useQuery<AxiosResponse<LicensesResponse>>({
    queryKey: ['licenses', page],
    queryFn: () => api.get(`/api/licenses?skip=${(page - 1) * limit}&limit=${limit}`)
  });
};

export const useLicense = (id: string) => {
  return useQuery<AxiosResponse<License>>({
    queryKey: ['license', id],
    queryFn: () => api.get(`/api/licenses/${id}`),
    enabled: !!id,
  });
};

export const useCreateLicense = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<License>, Error, Partial<License>, unknown>({
    mutationFn: (license: Partial<License>) => api.post('/api/licenses', license),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['licenseStats'] });
    },
  });
};

export const useUpdateLicense = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<License>, Error, Partial<License>, unknown>({
    mutationFn: (license: Partial<License>) => api.put(`/api/licenses/${id}`, license),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license', id] });
      queryClient.invalidateQueries({ queryKey: ['licenseStats'] });
    },
  });
};

export const useDeleteLicense = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<void>, Error, string, unknown>({
    mutationFn: (id: string) => api.delete(`/api/licenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['licenseStats'] });
    },
  });
};

export const useExpiringLicenses = () => {
  return useQuery<AxiosResponse<ExpiringLicense[]>>({
    queryKey: ['licenses', 'expiring'],
    queryFn: () => api.get('/api/licenses/expiring')
  });
};

export const useDeviceLicenses = (serviceTag: string) => {
  return useQuery<AxiosResponse<License[]>>({    queryKey: ['licenses', 'device', serviceTag],
    queryFn: () => api.get(`/api/licenses/device/${serviceTag}`),
    enabled: !!serviceTag,
  });
};

export const useLicenseDevices = (licenseType: string) => {
  return useQuery<AxiosResponse<Device[]>>({    queryKey: ['devices', 'license', licenseType],
    queryFn: () => api.get(`/api/devices/license/${licenseType}`),
    enabled: !!licenseType,
  });
};

export const useLicenseStats = () => {
  return useQuery<AxiosResponse<LicenseStats>>({
    queryKey: ['licenses', 'stats'],
    queryFn: () => api.get('/api/licenses/stats')
  });
};

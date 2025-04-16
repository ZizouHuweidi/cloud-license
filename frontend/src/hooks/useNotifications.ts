import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { api } from '../client/api';
import { Notification, NotificationsResponse } from '../types';

interface NotificationUpdate {
  read?: boolean;
}

export const useNotifications = (page = 1, limit = 10) => {
  return useQuery<AxiosResponse<NotificationsResponse>>({
    queryKey: ['notifications', page],
    queryFn: () => api.get(`/api/notifications?skip=${(page - 1) * limit}&limit=${limit}`),
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useNotification = (id: string) => {
  return useQuery<AxiosResponse<Notification>>({
    queryKey: ['notification', id],
    queryFn: () => api.get(`/api/notifications/${id}`),
    enabled: !!id,
  });
};

export const useUpdateNotification = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<Notification>, Error, NotificationUpdate, unknown>({
    mutationFn: (update: NotificationUpdate) => api.put(`/api/notifications/${id}`, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<void>, Error, string, unknown>({
    mutationFn: (id: string) => api.delete(`/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

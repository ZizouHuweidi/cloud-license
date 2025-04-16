import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { api } from '../client/api';
import { AuditLogResponse } from '../types';

export const useEntityAuditLogs = (entityType: string, entityId: string, page = 1, limit = 10) => {
  return useQuery<AxiosResponse<AuditLogResponse>>({
    queryKey: ['audit-logs', entityType, entityId, page],
    queryFn: () => api.get(`/api/audit-logs/${entityType}/${entityId}?skip=${(page - 1) * limit}&limit=${limit}`),
    enabled: !!entityType && !!entityId,
  });
};

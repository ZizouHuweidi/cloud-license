export interface Device {
  id: string;
  name: string;
  service_tag: string;
  model: string;
  serial_number: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface DeviceWithLicenses extends Device {
  licenses: License[];
}

export interface Notification {
  id: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  read: boolean;
  notification_date: string;
  sent: boolean;
  license_id: string;
  license?: License;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changes: Record<string, any>;
  timestamp: string;
  user_id?: string;
  user?: User;
}

export interface AuditLogResponse {
  data: AuditLog[];
  count: number;
}

export interface NotificationsResponse {
  data: Notification[];
  count: number;
}

export interface License {
  id: string;
  device_id: string;
  device: Device;
  type: 'standard' | 'premium' | 'enterprise';
  key: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceStats {
  total_devices: number;
  active_devices: number;
  inactive_devices: number;
  maintenance_devices: number;
}

export interface LicenseStats {
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  expiring_soon: number;
}

export interface ExpiringLicense extends License {
  days_until_expiry: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

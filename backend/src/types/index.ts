export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey';
  basic?: { username: string; password: string };
  bearer?: { token: string };
  apikey?: { key: string; value: string; addTo: 'header' | 'query' };
}

export interface KeyValueItem {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface BodyConfig {
  type: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'json';
  raw?: string;
  formUrlEncoded?: KeyValueItem[];
  formData?: Array<KeyValueItem & { type: 'text' | 'file' }>;
}

export interface RequestDoc {
  _id: string;
  projectId: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: KeyValueItem[];
  params: KeyValueItem[];
  body: BodyConfig;
  auth: AuthConfig;
  response?: ResponseData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  size: number;
  time: number;
}

export interface ProjectDoc {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

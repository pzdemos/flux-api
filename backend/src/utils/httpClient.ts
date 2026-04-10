import axios, { AxiosRequestConfig } from 'axios';
import { ResponseData } from '../types';

export async function sendHttpRequest(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  params: Record<string, string> = {},
  data?: any,
  auth?: any
): Promise<ResponseData> {
  const startTime = Date.now();

  // Build auth headers
  if (auth?.type === 'basic' && auth.basic) {
    const credentials = Buffer.from(
      `${auth.basic.username}:${auth.basic.password}`
    ).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else if (auth?.type === 'bearer' && auth.bearer) {
    headers['Authorization'] = `Bearer ${auth.bearer.token}`;
  } else if (auth?.type === 'apikey' && auth.apikey) {
    if (auth.apikey.addTo === 'header') {
      headers[auth.apikey.key] = auth.apikey.value;
    }
  }

  // Build params with apikey in query if needed
  const queryParams = { ...params };
  if (auth?.type === 'apikey' && auth.apikey?.addTo === 'query') {
    queryParams[auth.apikey.key] = auth.apikey.value;
  }

  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    data,
    timeout: 30000,
    validateStatus: () => true, // Accept all status codes
    maxRedirects: 5,
  };

  try {
    const response = await axios(config);
    const endTime = Date.now();
    const time = endTime - startTime;

    // Build response headers
    const responseHeaders: Record<string, string> = {};
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        responseHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
      });
    }

    // Calculate response size
    const bodyString = typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data);
    const size = bodyString.length;

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: bodyString,
      size,
      time,
    };
  } catch (error: any) {
    const endTime = Date.now();
    const time = endTime - startTime;

    if (error.code === 'ECONNABORTED') {
      return {
        status: 0,
        statusText: 'Timeout',
        headers: {},
        body: JSON.stringify({ error: 'Request timeout after 30s' }),
        size: 0,
        time,
      };
    }

    return {
      status: error.response?.status || 0,
      statusText: error.message || 'Unknown error',
      headers: error.response?.headers || {},
      body: error.response?.data
        ? JSON.stringify(error.response.data)
        : JSON.stringify({ error: error.message }),
      size: 0,
      time,
    };
  }
}

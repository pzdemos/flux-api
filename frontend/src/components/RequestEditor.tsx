import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Input,
  Button,
  Tabs,
  Space,
  Form,
  message,
  Drawer,
  List,
  Typography,
} from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import KeyValueEditor from './KeyValueEditor';
import ResponseViewer from './ResponseViewer';
import { requestApi } from '../services/api';
import type { ApiRequest, KeyValueItem, BodyConfig, AuthConfig } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const BODY_TYPES = ['none', 'raw', 'json', 'x-www-form-urlencoded', 'form-data'];

interface RequestEditorProps {
  request?: ApiRequest;
  projectId?: string;
  onSave?: (request: ApiRequest) => void;
}

const DEFAULT_REQUEST: Partial<ApiRequest> = {
  method: 'GET',
  url: '',
  headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
  params: [],
  body: { type: 'none' },
  auth: { type: 'none' },
};

export const RequestEditor: React.FC<RequestEditorProps> = ({
  request: initialRequest,
  projectId,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [request, setRequest] = useState<Partial<ApiRequest>>(initialRequest || DEFAULT_REQUEST);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(request?.response);

  useEffect(() => {
    if (initialRequest) {
      setRequest(initialRequest);
      setResponse(initialRequest.response);
    }
  }, [initialRequest]);

  const updateRequest = (updates: Partial<ApiRequest>) => {
    setRequest((prev) => ({ ...prev, ...updates }));
  };

  const handleSend = async (saveResponse = false) => {
    if (!request.url) {
      message.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (saveResponse && request._id) {
        res = await requestApi.send(request._id, request);
        setResponse(res.data.response);
        if (onSave) {
          onSave(res.data.request);
        }
      } else {
        res = await requestApi.sendOnly(request);
        setResponse(res.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!request.name || !request.url) {
      message.error('Please fill in the required fields');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (request._id) {
        res = await requestApi.update(request._id, request);
        message.success('Request updated');
      } else {
        res = await requestApi.create({
          ...request,
          projectId: projectId || '',
        } as ApiRequest);
        message.success('Request saved');
      }
      if (onSave) {
        onSave(res.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const bodyItems = [
    {
      key: 'none',
      label: 'none',
      children: <Text type="secondary">This request does not have a body</Text>,
    },
    {
      key: 'raw',
      label: 'raw',
      children: (
        <TextArea
          value={request.body?.raw || ''}
          onChange={(e) =>
            updateRequest({ body: { ...request.body!, type: 'raw', raw: e.target.value } })
          }
          placeholder="Enter raw body content"
          rows={10}
        />
      ),
    },
    {
      key: 'json',
      label: 'json',
      children: (
        <TextArea
          value={request.body?.raw || ''}
          onChange={(e) =>
            updateRequest({ body: { ...request.body!, type: 'json', raw: e.target.value } })
          }
          placeholder='{"key": "value"}'
          rows={10}
        />
      ),
    },
    {
      key: 'x-www-form-urlencoded',
      label: 'x-www-form-urlencoded',
      children: (
        <KeyValueEditor
          items={request.body?.formUrlEncoded || []}
          onChange={(items) =>
            updateRequest({ body: { ...request.body!, type: 'x-www-form-urlencoded', formUrlEncoded: items } })
          }
        />
      ),
    },
    {
      key: 'form-data',
      label: 'form-data',
      children: (
        <KeyValueEditor
          items={request.body?.formData || []}
          onChange={(items) =>
            updateRequest({
              body: {
                ...request.body!,
                type: 'form-data',
                formData: items.map((i) => ({ ...i, type: 'text' as const })),
              },
            })
          }
        />
      ),
    },
  ];

  const authItems = [
    {
      key: 'none',
      label: 'No Auth',
      children: <Text type="secondary">No authentication</Text>,
    },
    {
      key: 'basic',
      label: 'Basic Auth',
      children: (
        <Space direction="vertical" className="w-full">
          <Input
            placeholder="Username"
            value={request.auth?.basic?.username || ''}
            onChange={(e) =>
              updateRequest({
                auth: { type: 'basic', basic: { ...request.auth?.basic, username: e.target.value } },
              })
            }
          />
          <Input.Password
            placeholder="Password"
            value={request.auth?.basic?.password || ''}
            onChange={(e) =>
              updateRequest({
                auth: { type: 'basic', basic: { ...request.auth?.basic!, password: e.target.value } },
              })
            }
          />
        </Space>
      ),
    },
    {
      key: 'bearer',
      label: 'Bearer Token',
      children: (
        <Input
          placeholder="Token"
          value={request.auth?.bearer?.token || ''}
          onChange={(e) =>
            updateRequest({
              auth: { type: 'bearer', bearer: { token: e.target.value } },
            })
          }
        />
      ),
    },
    {
      key: 'apikey',
      label: 'API Key',
      children: (
        <Space direction="vertical" className="w-full">
          <Input
            placeholder="Key"
            value={request.auth?.apikey?.key || ''}
            onChange={(e) =>
              updateRequest({
                auth: {
                  type: 'apikey',
                  apikey: { ...request.auth?.apikey!, key: e.target.value },
                },
              })
            }
          />
          <Input
            placeholder="Value"
            value={request.auth?.apikey?.value || ''}
            onChange={(e) =>
              updateRequest({
                auth: {
                  type: 'apikey',
                  apikey: { ...request.auth?.apikey!, value: e.target.value },
                },
              })
            }
          />
          <Select
            value={request.auth?.apikey?.addTo || 'header'}
            onChange={(value) =>
              updateRequest({
                auth: {
                  type: 'apikey',
                  apikey: { ...request.auth?.apikey!, addTo: value },
                },
              })
            }
            options={[
              { label: 'Header', value: 'header' },
              { label: 'Query Param', value: 'query' },
            ]}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <Card size="small">
        <Space.Compact className="w-full">
          <Select
            value={request.method}
            onChange={(value) => updateRequest({ method: value })}
            options={METHODS.map((m) => ({ label: m, value: m }))}
            className="w-32"
          />
          <Input
            placeholder="https://api.example.com/endpoint"
            value={request.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            onPressEnter={() => handleSend(true)}
          />
          <Button
            type="primary"
            icon={loading ? <LoadingOutlined /> : <SendOutlined />}
            onClick={() => handleSend(true)}
            loading={loading}
          >
            Send
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </Space.Compact>
      </Card>

      <Card className="flex-1 overflow-auto">
        <Tabs
          defaultActiveKey="params"
          items={[
            {
              key: 'params',
              label: 'Params',
              children: (
                <KeyValueEditor
                  items={request.params || []}
                  onChange={(items) => updateRequest({ params: items })}
                  placeholder={{ key: 'Parameter name', value: 'Parameter value' }}
                />
              ),
            },
            {
              key: 'authorization',
              label: 'Authorization',
              children: (
                <Tabs
                  type="card"
                  activeKey={request.auth?.type || 'none'}
                  onChange={(key) =>
                    updateRequest({ auth: { type: key as AuthConfig['type'] } })
                  }
                  items={authItems}
                />
              ),
            },
            {
              key: 'headers',
              label: 'Headers',
              children: (
                <KeyValueEditor
                  items={request.headers || []}
                  onChange={(items) => updateRequest({ headers: items })}
                />
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <Tabs
                  type="card"
                  activeKey={request.body?.type || 'none'}
                  onChange={(key) =>
                    updateRequest({
                      body: { ...request.body!, type: key as BodyConfig['type'] },
                    })
                  }
                  items={bodyItems}
                />
              ),
            },
          ]}
        />
      </Card>

      <ResponseViewer response={response} loading={loading} />
    </div>
  );
};

export default RequestEditor;

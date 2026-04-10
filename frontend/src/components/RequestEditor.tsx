import React, { useState, useEffect } from 'react';
import { Select, Input, Button, Tabs, Space, message, Typography } from 'antd';
import { SendOutlined, SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { Allotment } from 'allotment';
import Editor from '@monaco-editor/react';
import KeyValueEditor from './KeyValueEditor';
import ResponseViewer from './ResponseViewer';
import { requestApi } from '../services/api';
import type { ApiRequest, BodyConfig, AuthConfig } from '../types';

const { Text } = Typography;

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const BODY_TYPES = ['none', 'raw', 'json', 'x-www-form-urlencoded', 'form-data'];

interface RequestEditorProps {
  request: ApiRequest;
  projectId: string;
  onSave?: (request: ApiRequest) => void;
  onChange?: (updates: Partial<ApiRequest>) => void;
}

export const RequestEditor: React.FC<RequestEditorProps> = ({
  request,
  projectId,
  onSave,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(request.response);

  // Sync internal request when prop changes (for new tabs)
  // We don't overwrite if we are dirty, since Zustand manages it.

  const updateRequest = (updates: Partial<ApiRequest>) => {
    if (onChange) {
      onChange(updates);
    }
  };

  const handleSend = async (saveResponse = false) => {
    if (!request.url) {
      message.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      let res;
      const isNewRequest = !request._id || request._id.length !== 24;

      if (saveResponse && !isNewRequest) {
        res = await requestApi.send(request._id as string, request);
        setResponse(res.data.response);
        if (onSave) {
          onSave(res.data.request);
        }
      } else {
        const payload = { ...request };
        delete payload._id; // Ensure we don't accidentally send nanoid
        res = await requestApi.sendOnly(payload as ApiRequest);
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
      // MongoDB ObjectIds are exactly 24 hex characters
      // If It's longer or shorter (nanoid is usually 21), it is a local unsaved tab.
      const isNewRequest = !request._id || request._id.length !== 24;

      const payload = { ...request, projectId };
      
      if (!isNewRequest) {
        res = await requestApi.update(request._id as string, payload);
        message.success('Request updated');
      } else {
        delete payload._id; // Remove local nanoid before sending to DB
        res = await requestApi.create(payload as ApiRequest);
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
      children: <div className="p-4 text-gray-500">This request does not have a body</div>,
    },
    {
      key: 'raw',
      label: 'raw',
      children: (
        <div className="h-48 border rounded relative">
          <Editor
             height="100%"
             defaultLanguage="plaintext"
             value={request.body?.raw || ''}
             onChange={(val) => updateRequest({ body: { ...request.body!, type: 'raw', raw: val || '' } })}
             options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
          />
        </div>
      ),
    },
    {
      key: 'json',
      label: 'json',
      children: (
        <div className="h-48 border rounded relative">
          <Editor
             height="100%"
             defaultLanguage="json"
             value={request.body?.raw || ''}
             onChange={(val) => updateRequest({ body: { ...request.body!, type: 'json', raw: val || '' } })}
             options={{ minimap: { enabled: false }, fontSize: 13, formatOnPaste: true, formatOnType: true }}
          />
        </div>
      ),
    },
    {
      key: 'x-www-form-urlencoded',
      label: 'x-www-form-urlencoded',
      children: (
        <div className="p-2">
          <KeyValueEditor
            items={request.body?.formUrlEncoded || []}
            onChange={(items) =>
              updateRequest({ body: { ...request.body!, type: 'x-www-form-urlencoded', formUrlEncoded: items } })
            }
          />
        </div>
      ),
    },
    {
      key: 'form-data',
      label: 'form-data',
      children: (
        <div className="p-2">
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
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 顶部请求操作栏 */}
      <div className="flex items-center px-4 py-3 border-b shrink-0 gap-2 overflow-hidden bg-white">
        <Space.Compact className="w-full max-w-4xl shadow-sm">
          <Select
            value={request.method}
            onChange={(value) => updateRequest({ method: value })}
            options={METHODS.map((m) => ({ label: m, value: m }))}
            className="w-28 text-center font-bold"
            dropdownMatchSelectWidth={false}
            size="large"
          />
          <Input
            placeholder="Enter request URL"
            value={request.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            onPressEnter={() => handleSend(true)}
            size="large"
            className="flex-1 font-mono"
          />
          <Button
            type="primary"
            icon={loading ? <LoadingOutlined /> : <SendOutlined />}
            onClick={() => handleSend(true)}
            loading={loading}
            size="large"
            className="w-24 font-semibold shrink-0"
          >
            Send
          </Button>
        </Space.Compact>
        <Button 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          size="large"
          className="ml-2 font-semibold flex items-center justify-center shrink-0"
        >
          Save
        </Button>
      </div>

      <div className="flex-1 bg-white" style={{ contain: 'strict' }}>
        <Allotment vertical defaultSizes={[50, 50]}>
          <Allotment.Pane minSize={150}>
             {/* Request Configuration */}
             <div className="flex flex-col h-full relative">
               <Tabs
                  defaultActiveKey="params"
                  className="flex-1"
                  tabBarStyle={{ margin: 0, paddingLeft: 16 }}
                  items={[
                    {
                      key: 'params',
                      label: 'Params',
                      children: (
                        <div className="p-4 overflow-auto h-full">
                          <KeyValueEditor
                            items={request.params || []}
                            onChange={(items) => updateRequest({ params: items })}
                            placeholder={{ key: 'Query Param', value: 'Value' }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'headers',
                      label: 'Headers',
                      children: (
                        <div className="p-4 overflow-auto h-full">
                          <KeyValueEditor
                            items={request.headers || []}
                            onChange={(items) => updateRequest({ headers: items })}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'body',
                      label: 'Body',
                      children: (
                        <div className="flex flex-col h-full p-2">
                          <Tabs
                            size="small"
                            type="card"
                            activeKey={request.body?.type || 'none'}
                            onChange={(key) =>
                              updateRequest({
                                body: { ...request.body!, type: key as BodyConfig['type'] },
                              })
                            }
                            items={bodyItems}
                            className="flex-1"
                          />
                        </div>
                      ),
                    },
                  ]}
               />
             </div>
          </Allotment.Pane>
          <Allotment.Pane minSize={100}>
            {/* Response Viewer */}
            <div className="h-full border-t border-gray-200 bg-gray-50 relative">
               <ResponseViewer response={response} loading={loading} />
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};

export default RequestEditor;

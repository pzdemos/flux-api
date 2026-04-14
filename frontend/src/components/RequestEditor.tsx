import React, { useState, useEffect, useMemo } from 'react';
import { Select, Input, Button, Tabs, Space, message, Typography, Modal, Form } from 'antd';
import { SendOutlined, SaveOutlined, LoadingOutlined, CodeOutlined, CopyOutlined, MenuOutlined } from '@ant-design/icons';
import { Allotment } from 'allotment';
import Editor from '@monaco-editor/react';
import { useWorkspaceStore } from '../store/workspaceStore';
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
  const setMobileDrawerOpen = useWorkspaceStore(state => state.setMobileDrawerOpen);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        delete payload._id;
        res = await requestApi.sendOnly(payload as ApiRequest);
        setResponse(res.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveForm] = Form.useForm();
  const [curlModalVisible, setCurlModalVisible] = useState(false);

  const generatedCurl = useMemo(() => {
    if (!curlModalVisible) return '';
    let curl = `curl --request ${request.method} \\\n  --url '${request.url || ''}'`;
    
    if (request.auth?.type === 'bearer' && request.auth.bearer?.token) {
      curl += ` \\\n  --header 'Authorization: Bearer ${request.auth.bearer.token}'`;
    }
    
    const headers = request.headers?.filter(h => h.key && h.enabled !== false) || [];
    let hasContentType = false;
    headers.forEach(h => {
      curl += ` \\\n  --header '${h.key}: ${h.value}'`;
      if (h.key.toLowerCase() === 'content-type') hasContentType = true;
    });

    const params = request.params?.filter(p => p.key && p.enabled !== false) || [];
    if (params.length > 0) {
      const queryString = params.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
      const hasQuery = request.url?.includes('?');
      curl = curl.replace(`'${request.url}'`, `'${request.url}${hasQuery ? '&' : '?'}${queryString}'`);
    }

    if (request.body?.type === 'json' && request.body.raw) {
      const escapedBody = request.body.raw.replace(/'/g, "'\\''");
      if (!hasContentType) curl += ` \\\n  --header 'Content-Type: application/json'`;
      curl += ` \\\n  --data '${escapedBody}'`;
    } else if (request.body?.type === 'raw' && request.body.raw) {
      const escapedBody = request.body.raw.replace(/'/g, "'\\''");
      curl += ` \\\n  --data '${escapedBody}'`;
    } else if (request.body?.type === 'x-www-form-urlencoded') {
      const formItems = request.body.formUrlEncoded?.filter(i => i.key && i.enabled !== false) || [];
      formItems.forEach(i => {
        curl += ` \\\n  --data-urlencode '${i.key}=${i.value}'`;
      });
    } else if (request.body?.type === 'form-data') {
      const formItems = request.body.formData?.filter(i => i.key && i.enabled !== false) || [];
      formItems.forEach(i => {
        curl += ` \\\n  --form '${i.key}="${i.value}"'`;
      });
    }

    return curl;
  }, [curlModalVisible, request]);

  const handleSaveClick = () => {
      const isNewRequest = !request._id || request._id.length !== 24;
      if (isNewRequest || !request.name || request.name === 'Untitled Request') {
        saveForm.setFieldsValue({ name: request.name === 'Untitled Request' ? '' : request.name });
        setSaveModalVisible(true);
      } else {
        executeSave(request.name);
      }
  };

  const executeSave = async (finalName: string) => {
    if (!request.url) {
      message.error('Please fill in the URL');
      return;
    }

    setLoading(true);
    setSaveModalVisible(false);
    
    updateRequest({ name: finalName });

    try {
      let res;
      const isNewRequest = !request._id || request._id.length !== 24;
      const payload = { ...request, name: finalName, projectId };
      
      if (!isNewRequest) {
        res = await requestApi.update(request._id as string, payload);
        message.success('Request updated');
      } else {
        delete payload._id;
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

  // ========== Mobile Layout ==========
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', position: 'relative' }}>
        {/* Mobile URL Bar */}
        <div className="mobile-url-bar">
          <div style={{ padding: '0 0 8px 4px' }}>
            <Input
              variant="borderless"
              placeholder="Untitled Request"
              value={request.name || ''}
              onChange={(e) => updateRequest({ name: e.target.value })}
              style={{ fontSize: 16, fontWeight: 700, padding: 0, height: 'auto', background: 'transparent' }}
            />
          </div>
          <div className="mobile-url-row">
            <Space.Compact style={{ width: '100%', flex: 1 }}>
              <Select
                value={request.method}
                onChange={(value) => updateRequest({ method: value })}
                options={METHODS.map((m) => ({ label: m, value: m }))}
                style={{ width: 90 }}
                popupMatchSelectWidth={false}
                size="large"
              />
              <Input
                placeholder="Enter request URL"
                value={request.url}
                onChange={(e) => updateRequest({ url: e.target.value })}
                onPressEnter={() => handleSend(true)}
                size="large"
                style={{ flex: 1, fontFamily: "'SF Mono', Menlo, Monaco, monospace", fontSize: 13 }}
              />
              <Button
                type="primary"
                icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                onClick={() => handleSend(true)}
                loading={loading}
                size="large"
                className="mobile-send-btn"
              />
            </Space.Compact>
          </div>

          {/* Action Chips */}
          <div className="mobile-action-bar">
            <Button
              icon={<SaveOutlined />}
              onClick={handleSaveClick}
              className="mobile-action-chip"
            >
              Save
            </Button>
            <Button
              icon={<CodeOutlined />}
              onClick={() => setCurlModalVisible(true)}
              className="mobile-action-chip"
            >
              cURL
            </Button>
          </div>
        </div>

        {/* Content Area with vertical split */}
        <div style={{ flex: 1, overflow: 'hidden', contain: 'strict' }}>
          <Allotment vertical defaultSizes={[55, 45]}>
            <Allotment.Pane minSize={120}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                <Tabs
                  defaultActiveKey="params"
                  className="flex-1"
                  tabBarStyle={{ margin: 0, paddingLeft: 12, fontSize: 13 }}
                  size="small"
                  items={[
                    {
                      key: 'params',
                      label: 'Params',
                      children: (
                        <div style={{ padding: 12, overflow: 'auto', height: '100%' }}>
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
                        <div style={{ padding: 12, overflow: 'auto', height: '100%' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 8 }}>
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
            <Allotment.Pane minSize={80}>
              <div style={{ height: '100%', borderTop: '0.5px solid var(--color-border-light)', background: '#fafbfc', position: 'relative' }}>
                <ResponseViewer response={response} loading={loading} isMobile={true} />
              </div>
            </Allotment.Pane>
          </Allotment>
        </div>

        {/* Modals */}
        <Modal
          title="Save Request"
          open={saveModalVisible}
          onOk={() => {
            saveForm.validateFields().then((values) => {
              executeSave(values.name);
            });
          }}
          onCancel={() => setSaveModalVisible(false)}
          okText="Save"
        >
          <Form form={saveForm} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Request Name"
              rules={[{ required: true, message: 'Please enter a name for this request' }]}
            >
              <Input placeholder="e.g. Get User Profile" autoFocus />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div className="flex items-center justify-between mt-1 mb-2">
              <span>Generate Code Snippet</span>
              <Button 
                icon={<CopyOutlined />} 
                size="small" 
                type="text" 
                onClick={() => {
                   navigator.clipboard.writeText(generatedCurl);
                   message.success('Copied to clipboard');
                }}
                className="mr-6 text-blue-500 font-semibold"
              >
                Copy
              </Button>
            </div>
          }
          open={curlModalVisible}
          onCancel={() => setCurlModalVisible(false)}
          footer={null}
          width={isMobile ? '95vw' : 700}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ height: isMobile ? 280 : 400, borderTop: '1px solid #f0f0f0' }}>
            <Editor
               height="100%"
               defaultLanguage="shell"
               value={generatedCurl}
               theme="vs-light"
               options={{
                 readOnly: true,
                 minimap: { enabled: false },
                 wordWrap: "on",
                 scrollBeyondLastLine: false,
                 fontSize: 12,
                 fontFamily: "Menlo, Monaco, 'Courier New', monospace"
               }}
            />
          </div>
        </Modal>
      </div>
    );
  }

  // ========== Desktop Layout ==========
  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex flex-col px-4 py-3 border-b shrink-0 gap-3 bg-white">
        <div className="flex items-center">
          <Input 
            variant="borderless"
            placeholder="Untitled Request"
            value={request.name || ''}
            onChange={(e) => updateRequest({ name: e.target.value })}
            className="text-lg font-semibold px-1 py-0 h-8 max-w-sm hover:hover:bg-gray-50 focus:bg-white transition-colors"
            style={{ minWidth: 250, border: '1px solid transparent' }}
          />
        </div>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-2">
          <div className="flex items-center gap-2 w-full md:flex-1">
            <Space.Compact className="w-full flex-1 shadow-sm object-contain">
              <Select
                value={request.method}
                onChange={(value) => updateRequest({ method: value })}
                options={METHODS.map((m) => ({ label: m, value: m }))}
                className="w-24 md:w-28 text-center font-bold"
                popupMatchSelectWidth={false}
                size="large"
              />
              <Input
                placeholder="Enter request URL"
                value={request.url}
                onChange={(e) => updateRequest({ url: e.target.value })}
                onPressEnter={() => handleSend(true)}
                size="large"
                className="flex-1 font-mono min-w-0"
              />
              <Button
                type="primary"
                icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                onClick={() => handleSend(true)}
                loading={loading}
                size="large"
                className="w-24 font-semibold shrink-0 flex items-center justify-center px-4"
              >
                <span className="ml-1">Send</span>
              </Button>
            </Space.Compact>
          </div>

          <div className="flex justify-end items-center gap-2">
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSaveClick}
              size="large"
              className="font-semibold flex items-center justify-center shrink-0"
            >
              Save
            </Button>
            <Button 
              icon={<CodeOutlined />} 
              onClick={() => setCurlModalVisible(true)}
              size="large"
              className="flex items-center justify-center shrink-0"
            >
              cURL
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-hidden" style={{ contain: 'strict' }}>
        <Allotment vertical={false} defaultSizes={[50, 50]}>
          <Allotment.Pane minSize={150}>
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
            <div className="h-full border-t border-gray-200 bg-gray-50 relative">
               <ResponseViewer response={response} loading={loading} />
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>

      <Modal
        title="Save Request"
        open={saveModalVisible}
        onOk={() => {
          saveForm.validateFields().then((values) => {
            executeSave(values.name);
          });
        }}
        onCancel={() => setSaveModalVisible(false)}
        okText="Save"
      >
        <Form form={saveForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Request Name"
            rules={[{ required: true, message: 'Please enter a name for this request' }]}
          >
            <Input placeholder="e.g. Get User Profile" autoFocus />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center justify-between mt-1 mb-2">
            <span>Generate Code Snippet</span>
            <Button 
              icon={<CopyOutlined />} 
              size="small" 
              type="text" 
              onClick={() => {
                 navigator.clipboard.writeText(generatedCurl);
                 message.success('Copied to clipboard');
              }}
              className="mr-6 text-blue-500 font-semibold"
            >
              Copy
            </Button>
          </div>
        }
        open={curlModalVisible}
        onCancel={() => setCurlModalVisible(false)}
        footer={null}
        width={700}
        styles={{ body: { padding: 0 } }}
      >
        <div className="h-[400px] border-t border-gray-200">
          <Editor
             height="100%"
             defaultLanguage="shell"
             value={generatedCurl}
             theme="vs-light"
             options={{
               readOnly: true,
               minimap: { enabled: false },
               wordWrap: "on",
               scrollBeyondLastLine: false,
               fontSize: 13,
               fontFamily: "Menlo, Monaco, 'Courier New', monospace"
             }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RequestEditor;

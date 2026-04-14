import React, { useMemo, useState } from 'react';
import { Tabs, Tag, Typography, Spin, Empty } from 'antd';
import { LoadingOutlined, CloudOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import type { ResponseData } from '../types';

const { Text } = Typography;

interface ResponseViewerProps {
  response?: ResponseData;
  loading?: boolean;
  isMobile?: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  loading,
  isMobile = false,
}) => {
  const [activeKey, setActiveKey] = useState('body');

  const statusColor = useMemo(() => {
    if (!response) return 'default';
    if (response.status >= 200 && response.status < 300) return 'success';
    if (response.status >= 300 && response.status < 400) return 'warning';
    if (response.status >= 400 && response.status < 500) return 'error';
    if (response.status >= 500) return 'error';
    return 'default';
  }, [response]);

  const isError = response ? response.status >= 400 : false;

  const rawBodyString = useMemo(() => {
    if (!response?.body) return '';
    try {
      const obj = JSON.parse(response.body);
      return JSON.stringify(obj, null, 2);
    } catch {
      return response.body as string;
    }
  }, [response]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: '#fafbfc',
        gap: 12,
      }}>
        <LoadingOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} spin />
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Sending request...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: '#fafbfc',
        gap: 12,
        padding: 20,
      }}>
        <CloudOutlined style={{ fontSize: isMobile ? 28 : 36, color: '#d9d9d9' }} />
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Hit Send to get a response
        </span>
      </div>
    );
  }

  // ========== Mobile Layout ==========
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'absolute', inset: 0 }}>
        {/* Mobile Response Status Bar */}
        <div className="mobile-response-bar">
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: 4, flexShrink: 0 }}>
            Response
          </span>
          <span className={`mobile-response-badge status ${isError ? 'error' : ''}`}>
            {response.status} {response.statusText}
          </span>
          <span className="mobile-response-badge info">
            {formatTime(response.time)}
          </span>
          <span className="mobile-response-badge info">
            {formatSize(response.size)}
          </span>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={[
            { key: 'body', label: 'Body' },
            { key: 'headers', label: `Headers` }
          ]}
          size="small"
          tabBarStyle={{ margin: 0, padding: '0 12px', background: '#fafbfc', fontSize: 13 }}
        />

        {/* Content */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0, background: 'white' }}>
          {activeKey === 'body' && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <Editor
                height="100%"
                defaultLanguage="json"
                value={rawBodyString}
                theme="vs-light"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
                  lineNumbers: 'on',
                  glyphMargin: false,
                  folding: false,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
          )}

          {activeKey === 'headers' && (
            <div style={{ position: 'absolute', inset: 0, padding: 12, overflow: 'auto' }}>
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '10px 0',
                  borderBottom: '0.5px solid var(--color-border-light)',
                  gap: 2,
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    fontFamily: "'SF Mono', monospace",
                    wordBreak: 'break-all',
                  }}>
                    {key}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--color-text-primary)',
                    fontFamily: "'SF Mono', monospace",
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                  }}>
                    {value as React.ReactNode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== Desktop Layout ==========
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] absolute inset-0">
      <div className="h-10 flex items-center px-4 border-b border-gray-200 shrink-0 bg-gray-50 dark:bg-[#252526] text-sm">
        <span className="font-semibold text-gray-600 mr-4">Response</span>
        <Tag color={statusColor} bordered={false} className="font-mono text-xs">
          {response.status} {response.statusText}
        </Tag>
        <span className="text-gray-400 font-mono text-xs ml-4 tracking-tight">
          Time: <span className="text-gray-600 font-semibold">{formatTime(response.time)}</span>
        </span>
        <span className="text-gray-400 font-mono text-xs ml-4 tracking-tight">
          Size: <span className="text-gray-600 font-semibold">{formatSize(response.size)}</span>
        </span>
      </div>
      
      <Tabs 
         activeKey={activeKey} 
         onChange={setActiveKey}
         items={[
           { key: 'body', label: 'Body' },
           { key: 'headers', label: 'Headers' }
         ]} 
         tabBarStyle={{ margin: 0, padding: '0 16px', backgroundColor: '#f9fafb' }}
      />

      <div className="flex-1 relative min-h-0 bg-white">
        {activeKey === 'body' && (
          <div className="absolute inset-0">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={rawBodyString}
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
        )}
        
        {activeKey === 'headers' && (
          <div className="absolute inset-0 p-4 overflow-auto">
            <table className="w-full text-sm text-left">
              <tbody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <tr key={key} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-semibold text-gray-600 align-top w-1/3 break-all">{key}</td>
                    <td className="py-2 text-gray-800 break-all">{value as React.ReactNode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;

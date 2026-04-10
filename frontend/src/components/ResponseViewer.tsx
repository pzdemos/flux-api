import React, { useMemo } from 'react';
import { Card, Tabs, Tag, Typography, Statistic, Row, Col } from 'antd';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import type { ResponseData } from '../types';

const { Text, Paragraph } = Typography;

interface ResponseViewerProps {
  response?: ResponseData;
  loading?: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  loading,
}) => {
  const statusColor = useMemo(() => {
    if (!response) return 'default';
    if (response.status >= 200 && response.status < 300) return 'success';
    if (response.status >= 300 && response.status < 400) return 'warning';
    if (response.status >= 400 && response.status < 500) return 'error';
    if (response.status >= 500) return 'error';
    return 'default';
  }, [response]);

  const formattedBody = useMemo(() => {
    if (!response?.body) return null;
    try {
      return JSON.parse(response.body);
    } catch {
      return response.body;
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
      <Card loading title="Response" className="h-full">
        <div className="h-64" />
      </Card>
    );
  }

  if (!response) {
    return (
      <Card title="Response" className="h-full">
        <div className="flex items-center justify-center h-64 text-gray-400">
          Send a request to see the response
        </div>
      </Card>
    );
  }

  const items = [
    {
      key: 'body',
      label: 'Body',
      children: (
        <div className="response-body">
          {typeof formattedBody === 'object' && formattedBody !== null ? (
            <JsonView src={formattedBody} theme="vscode" collapsed={false} />
          ) : (
            <Paragraph>
              <Text code>{response.body}</Text>
            </Paragraph>
          )}
        </div>
      ),
    },
    {
      key: 'headers',
      label: 'Headers',
      children: (
        <div>
          {Object.entries(response.headers).map(([key, value]) => (
            <div key={key} className="mb-1">
              <Text strong>{key}:</Text> <Text>{value}</Text>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <Row gutter={16} align="middle">
          <Col>
            <Tag color={statusColor}>{response.status}</Tag>
            <Text>{response.statusText}</Text>
          </Col>
          <Col>
            <Text type="secondary">{formatTime(response.time)}</Text>
          </Col>
          <Col>
            <Text type="secondary">{formatSize(response.size)}</Text>
          </Col>
        </Row>
      }
      className="h-full"
    >
      <Tabs defaultActiveKey="body" items={items} />
    </Card>
  );
};

export default ResponseViewer;

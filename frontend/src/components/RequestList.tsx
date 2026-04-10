import React from 'react';
import { List, Typography, Tag, Space, Button, Empty, Tooltip } from 'antd';
import {
  FileTextOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ApiRequest } from '../types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface RequestListProps {
  requests: ApiRequest[];
  selectedId?: string;
  onSelect: (request: ApiRequest) => void;
  onDelete?: (id: string) => void;
  onNew?: () => void;
  loading?: boolean;
}

const methodColors: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'cyan',
  HEAD: 'purple',
  OPTIONS: 'purple',
};

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  selectedId,
  onSelect,
  onDelete,
  onNew,
  loading = false,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <Space className="w-full justify-between">
          <Text strong>Requests ({requests.length})</Text>
          {onNew && (
            <Button type="primary" size="small" onClick={onNew}>
              + New
            </Button>
          )}
        </Space>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 text-center text-secondary">Loading...</div>
        ) : requests.length === 0 ? (
          <Empty
            className="mt-10"
            description="No requests yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={requests}
            renderItem={(request) => (
              <List.Item
                key={request._id}
                onClick={() => onSelect(request)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedId === request._id ? 'bg-blue-50' : ''
                }`}
                actions={
                  onDelete
                    ? [
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(request._id);
                          }}
                        />,
                      ]
                    : undefined
                }
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined className="text-gray-400" />}
                  title={
                    <Space>
                      <Tag color={methodColors[request.method]}>{request.method}</Tag>
                      <Text ellipsis className="max-w-[150px]">
                        {request.name || 'Untitled'}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space size="small" className="text-xs">
                      <Tooltip title={request.url}>
                        <Text ellipsis className="max-w-[150px]">
                          {request.url}
                        </Text>
                      </Tooltip>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default RequestList;

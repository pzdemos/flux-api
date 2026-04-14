import React from 'react';
import { Space, Spin, Empty, Dropdown } from 'antd';
import { MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ApiRequest } from '../types';

interface RequestListProps {
  requests: ApiRequest[];
  selectedId?: string;
  onSelect: (request: ApiRequest) => void;
  onDelete?: (id: string) => void;
  onNew?: () => void;
  loading?: boolean;
  isMobile?: boolean;
}

const methodColors: Record<string, string> = {
  GET: 'text-blue-500',
  POST: 'text-green-500',
  PUT: 'text-orange-500',
  DELETE: 'text-red-500',
  PATCH: 'text-cyan-500',
  HEAD: 'text-purple-500',
  OPTIONS: 'text-purple-500',
};

const methodBadgeClass: Record<string, string> = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
  HEAD: 'head',
  OPTIONS: 'options',
};

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  selectedId,
  onSelect,
  onDelete,
  loading = false,
  isMobile = false,
}) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#1e1e1e]">
        <Spin />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <Empty description="No requests" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  // ========== Mobile Layout ==========
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {requests.map((request, index) => {
          const isActive = selectedId === request._id;
          return (
            <div
              key={request._id}
              onClick={() => onSelect(request)}
              className={`mobile-request-item ${isActive ? 'active' : ''} animate-slide-in`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className={`method-badge ${methodBadgeClass[request.method] || ''}`}>
                {request.method}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {request.name || 'Untitled'}
                </div>
                {request.url && (
                  <div style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: 2,
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    {request.url}
                  </div>
                )}
              </div>
              
              {onDelete && (
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'delete',
                        danger: true,
                        label: 'Delete Request',
                        icon: <DeleteOutlined />,
                        onClick: (e) => {
                          e.domEvent.stopPropagation();
                          onDelete(request._id);
                        }
                      }
                    ]
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <MoreOutlined style={{ color: 'var(--color-text-muted)', fontSize: 16 }} />
                  </div>
                </Dropdown>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ========== Desktop Layout ==========
  return (
    <div className="flex flex-col bg-white dark:bg-[#1e1e1e] h-full">
      {requests.map((request) => {
        const isActive = selectedId === request._id;
        return (
          <div
            key={request._id}
            onClick={() => onSelect(request)}
            className={`group px-4 py-2 flex items-center justify-between cursor-pointer select-none text-sm transition-colors border-b border-transparent ${
              isActive 
                ? 'bg-blue-50 dark:bg-[#2d2d2d] text-blue-700 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-[#2a2d2e] text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className={`font-bold text-[11px] w-10 shrink-0 ${methodColors[request.method] || 'text-gray-500'}`}>
                {request.method}
              </span>
              <span className={`truncate ${isActive ? 'font-medium' : ''}`}>
                {request.name || 'Untitled'}
              </span>
            </div>
            
            {onDelete && (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'delete',
                      danger: true,
                      label: 'Delete Request',
                      icon: <DeleteOutlined />,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        onDelete(request._id);
                      }
                    }
                  ]
                }}
              >
                <div 
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer shrink-0 transition-opacity flex items-center justify-center ${isActive ? 'opacity-100' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreOutlined className={isActive ? 'text-blue-500' : 'text-gray-500'} />
                </div>
              </Dropdown>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RequestList;

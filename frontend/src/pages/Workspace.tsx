import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Tooltip, Avatar, Tabs, message } from 'antd';
import { 
  FolderOpenOutlined, 
  HistoryOutlined, 
  SettingOutlined, 
  PlusOutlined, 
  AppstoreOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Allotment } from 'allotment';
import { projectApi, requestApi } from '../services/api';
import { RequestList } from '../components/RequestList';
import { RequestEditor } from '../components/RequestEditor';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { Project, ApiRequest } from '../types';

const { Sider, Content } = Layout;

const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { 
    openRequests, 
    activeRequestId, 
    addRequest, 
    removeRequest, 
    setActiveRequest, 
    clearRequests 
  } = useWorkspaceStore();

  const loadProject = async () => {
    if (!id) return;
    try {
      const { data } = await projectApi.get(id);
      setProject(data);
    } catch (error) {
      message.error('Failed to load project');
      navigate('/');
    }
  };

  const loadRequests = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await requestApi.getAll(id);
      setRequests(data);
    } catch (error) {
      message.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    loadRequests();
  }, [id, loadRequests]);

  const handleSelectRequest = (request: ApiRequest) => {
    addRequest(request);
  };

  const handleNewRequest = () => {
    addRequest({
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      projectId: id,
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      params: [],
      body: { type: 'none' },
      auth: { type: 'none' },
    });
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await requestApi.delete(requestId);
      message.success('Request deleted');
      removeRequest(requestId);
      loadRequests();
    } catch (error) {
      message.error('Failed to delete request');
    }
  };

  if (!project) return null;

  return (
    <Layout className="h-screen overflow-hidden bg-white dark:bg-[#1e1e1e]">
      <Sider width={56} className="bg-gray-50 border-r border-gray-200 shadow-sm z-10 relative" theme="light">
        <div className="flex flex-col items-center py-4 h-full w-full">
          <div className="flex flex-col items-center gap-6 mt-4 flex-1">
            <Tooltip placement="right" title="Projects">
              <AppstoreOutlined className="text-xl text-gray-400 hover:text-blue-500 cursor-pointer" onClick={() => navigate('/')} />
            </Tooltip>
            <Tooltip placement="right" title="Collections">
              <FolderOpenOutlined className="text-xl text-blue-500 cursor-pointer" />
            </Tooltip>
            <Tooltip placement="right" title="History">
              <HistoryOutlined className="text-xl text-gray-400 hover:text-blue-500 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="flex flex-col items-center mb-4 shrink-0">
            <SettingOutlined className="text-xl text-gray-400 hover:text-blue-500 cursor-pointer" />
          </div>
        </div>
      </Sider>

      <Layout>
        {/* 全局可拖拽分屏 */}
        <Allotment>
          <Allotment.Pane preferredSize={320} minSize={250} maxSize={500}>
            <div className="h-full bg-white flex flex-col border-r border-gray-200">
              <div className="h-12 border-b flex items-center px-4 font-semibold shrink-0 justify-between">
                <span>Collections</span>
                <PlusOutlined className="cursor-pointer hover:text-blue-500" onClick={handleNewRequest} />
              </div>
              <div className="flex-1 overflow-y-auto">
                <RequestList
                  requests={requests}
                  selectedId={activeRequestId || undefined}
                  onSelect={handleSelectRequest}
                  onDelete={handleDeleteRequest}
                  onNew={handleNewRequest}
                  loading={loading}
                />
              </div>
            </div>
          </Allotment.Pane>

          <Allotment.Pane>
            <Content className="h-full bg-white flex flex-col w-full min-w-0" style={{ contain: 'strict' }}>
              {openRequests.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <AppstoreOutlined className="text-6xl mb-4 opacity-20" />
                  <p>Select a request from the sidebar or start a new one</p>
                </div>
              ) : (
                <div className="flex flex-col h-full w-full">
                  {/* 多标签页区域 */}
                  <div className="bg-gray-50 border-b flex overflow-x-auto shrink-0 w-full" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    {openRequests.map((req) => {
                      const isActive = req._id === activeRequestId;
                      return (
                         <div 
                           key={req._id}
                           onClick={() => setActiveRequest(req._id!)}
                           className={`group flex items-center min-w-[120px] max-w-[200px] h-9 px-3 border-r cursor-pointer select-none text-sm relative ${isActive ? 'bg-white shadow-[0_-2px_0_#1677ff_inset]' : 'hover:bg-gray-100 text-gray-600'}`}
                         >
                           <span className={`mr-2 font-bold text-[10px] ${req.method === 'GET' ? 'text-blue-500' : req.method === 'POST' ? 'text-green-500' : 'text-yellow-500'}`}>
                             {req.method}
                           </span>
                           <span className="truncate flex-1 mr-4">{req.name || 'Untitled'}</span>
                           {req.isDirty && <span className="w-2 h-2 rounded-full bg-blue-400 absolute right-8 top-3.5"></span>}
                           <CloseOutlined 
                             className={`text-[10px] absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-500 p-1`} 
                             onClick={(e) => {
                               e.stopPropagation();
                               removeRequest(req._id!);
                             }} 
                           />
                         </div>
                      );
                    })}
                    <div className="w-full flex-1 border-b"></div>
                  </div>
                  
                  {/* 当前激活的请求编辑器 */}
                  <div className="flex-1 relative w-full h-full min-h-0 bg-white" style={{ contain: 'strict' }}>
                    {activeRequestId && (  
                      <RequestEditor
                        key={activeRequestId}
                        request={openRequests.find(r => r._id === activeRequestId) as ApiRequest}
                        projectId={project._id}
                        onSave={(savedReq) => {
                          useWorkspaceStore.getState().updateRequest(savedReq._id || activeRequestId, { ...savedReq, isDirty: false });
                          loadRequests();
                        }}
                        onChange={(updates) => {
                           useWorkspaceStore.getState().updateRequest(activeRequestId, updates);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </Content>
          </Allotment.Pane>
        </Allotment>
      </Layout>
    </Layout>
  );
};

export default Workspace;

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Tooltip, Avatar, Tabs, message, Drawer, Button } from 'antd';
import { 
  FolderOpenOutlined, 
  HistoryOutlined, 
  SettingOutlined, 
  PlusOutlined, 
  AppstoreOutlined,
  CloseOutlined,
  MenuOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined
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
    mobileDrawerOpen,
    addRequest, 
    removeRequest, 
    setActiveRequest, 
    clearRequests,
    setMobileDrawerOpen
  } = useWorkspaceStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (isMobile) setMobileDrawerOpen(false);
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

  // ========== Mobile Layout ==========
  if (isMobile) {
    return (
      <Layout className="h-screen overflow-hidden bg-white" style={{ height: '100dvh' }}>
        {/* Premium Mobile Header */}
        <div className="mobile-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mobile-header-action"
              onClick={() => setMobileDrawerOpen(true)}
              style={{ background: 'transparent', color: '#333', fontSize: 18 }}
            >
              <MenuOutlined />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="mobile-header-title">{project.name}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: -2 }}>
                {requests.length} request{requests.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button 
            className="mobile-header-action"
            onClick={handleNewRequest}
          >
            <PlusOutlined />
          </button>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={320}
          styles={{ body: { padding: 0 }, wrapper: { borderRadius: '0 20px 20px 0' } }}
          closable={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Drawer Header with gradient */}
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>Flux API</h3>
                  <p>{project.name}</p>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <CloseOutlined style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>

            {/* Drawer Navigation Pills */}
            <div className="mobile-drawer-nav">
              <button
                className="mobile-drawer-nav-item"
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <AppstoreOutlined /> Projects
              </button>
              <button className="mobile-drawer-nav-item active">
                <FolderOpenOutlined /> Collections
              </button>
              <button
                className="mobile-drawer-nav-item"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <HistoryOutlined /> History
              </button>
            </div>

            {/* Section Title */}
            <div className="mobile-drawer-section-title">
              Saved Requests ({requests.length})
            </div>

            {/* Request List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <RequestList
                requests={requests}
                selectedId={activeRequestId || undefined}
                onSelect={handleSelectRequest}
                onDelete={handleDeleteRequest}
                onNew={handleNewRequest}
                loading={loading}
                isMobile={true}
              />
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: '0.5px solid var(--color-border-light)',
              display: 'flex',
              gap: 8,
            }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { handleNewRequest(); setMobileDrawerOpen(false); }}
                block
                size="large"
                style={{
                  borderRadius: 12,
                  height: 44,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1677ff 0%, #4f46e5 100%)',
                  border: 'none',
                }}
              >
                New Request
              </Button>
            </div>
          </div>
        </Drawer>

        {/* Mobile Content */}
        <Layout style={{ flex: 1, overflow: 'hidden' }}>
          <Content style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', minWidth: 0 }}>
            {openRequests.length === 0 ? (
              <div className="mobile-empty-state" style={{ flex: 1 }}>
                <div className="mobile-empty-state-icon">
                  <ThunderboltOutlined />
                </div>
                <h3>Ready to explore</h3>
                <p>Open a saved request from the menu, or create a new one to get started</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleNewRequest}
                  size="large"
                  style={{
                    marginTop: 24,
                    borderRadius: 12,
                    height: 44,
                    paddingInline: 28,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1677ff 0%, #4f46e5 100%)',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(22, 119, 255, 0.3)',
                  }}
                >
                  New Request
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                {/* Mobile Tabs */}
                {openRequests.length > 1 && (
                  <div className="mobile-tabs-bar">
                    {openRequests.map((req) => {
                      const isActive = req._id === activeRequestId;
                      return (
                        <button
                          key={req._id}
                          onClick={() => setActiveRequest(req._id!)}
                          className={`mobile-tab-item ${isActive ? 'active' : ''}`}
                        >
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: req.method === 'GET' ? '#0958d9'
                              : req.method === 'POST' ? '#389e0d'
                              : req.method === 'DELETE' ? '#cf1322'
                              : '#d46b08',
                          }}>
                            {req.method}
                          </span>
                          <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {req.name || 'Untitled'}
                          </span>
                          <span
                            className="mobile-tab-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRequest(req._id!);
                            }}
                          >
                            <CloseOutlined style={{ fontSize: 9 }} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Request Editor */}
                <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0, background: '#fff', contain: 'strict' }}>
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
        </Layout>
      </Layout>
    );
  }

  // ========== Desktop Layout ==========
  return (
    <Layout className="h-screen overflow-hidden bg-white" style={{ height: '100dvh' }}>
      <Sider width={56} className="bg-gray-50 border-r border-gray-200 shadow-sm z-10 relative h-full" theme="light">
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

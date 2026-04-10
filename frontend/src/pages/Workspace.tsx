import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Breadcrumb, message, Modal } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { projectApi, requestApi } from '../services/api';
import { RequestList } from '../components/RequestList';
import { RequestEditor } from '../components/RequestEditor';
import type { Project, ApiRequest } from '../types';

const { Sider, Content, Header } = Layout;

export const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | undefined>();
  const [loading, setLoading] = useState(false);

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
    setSelectedRequest(request);
  };

  const handleNewRequest = () => {
    setSelectedRequest(undefined);
  };

  const handleSaveRequest = (request: ApiRequest) => {
    setSelectedRequest(request);
    loadRequests();
  };

  const handleDeleteRequest = async (requestId: string) => {
    Modal.confirm({
      title: 'Delete this request?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await requestApi.delete(requestId);
          message.success('Request deleted');
          if (selectedRequest?._id === requestId) {
            setSelectedRequest(undefined);
          }
          loadRequests();
        } catch (error) {
          message.error('Failed to delete request');
        }
      },
    });
  };

  if (!project) return null;

  return (
    <Layout className="h-screen">
      <Header className="bg-white border-b px-6 flex items-center">
        <Breadcrumb
          items={[
            { title: <HomeOutlined onClick={() => navigate('/')} className="cursor-pointer" /> },
            { title: project.name },
          ]}
        />
      </Header>
      <Layout>
        <Sider width={300} theme="light" className="border-r">
          <RequestList
            requests={requests}
            selectedId={selectedRequest?._id}
            onSelect={handleSelectRequest}
            onDelete={handleDeleteRequest}
            onNew={handleNewRequest}
            loading={loading}
          />
        </Sider>
        <Content className="p-4 bg-gray-50">
          <RequestEditor
            key={selectedRequest?._id || 'new'}
            request={selectedRequest}
            projectId={project._id}
            onSave={handleSaveRequest}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Workspace;

import React, { useEffect, useState } from 'react';
import { Button, Typography, Modal, Form, Input, message, Spin, Dropdown } from 'antd';
import {
  FolderOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  MoreOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface ProjectListProps {
  onSelect: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await projectApi.getAll();
      setProjects(data);
    } catch (error) {
      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProject(project);
    form.setFieldsValue(project);
    setModalVisible(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    Modal.confirm({
      title: 'Delete project?',
      content: 'This will delete all requests in this project.',
      okText: 'Delete',
      okButtonProps: { danger: true, size: 'small' },
      cancelButtonProps: { size: 'small' },
      onOk: async () => {
        try {
          await projectApi.delete(id);
          message.success('Project deleted');
          loadProjects();
        } catch (error) {
          message.error('Failed to delete project');
        }
      },
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingProject) {
        await projectApi.update(editingProject._id, values);
        message.success('Project updated');
      } else {
        await projectApi.create(values);
        message.success('Project created');
      }
      setModalVisible(false);
      loadProjects();
    } catch (error) {
      message.error(editingProject ? 'Failed to update' : 'Failed to create');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchText.toLowerCase())
  );

  // ========== Brand Logo ==========
  const BrandLogo = ({ size = 'large' }: { size?: 'large' | 'small' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'large' ? 10 : 8, userSelect: 'none' }}>
      <div style={{
        width: size === 'large' ? 36 : 28,
        height: size === 'large' ? 36 : 28,
        borderRadius: size === 'large' ? 10 : 7,
        background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(22, 119, 255, 0.25)',
      }}>
        <ThunderboltOutlined style={{ color: 'white', fontSize: size === 'large' ? 18 : 14 }} />
      </div>
      <span style={{
        fontSize: size === 'large' ? 22 : 16,
        fontWeight: 800,
        letterSpacing: '-0.5px',
        background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        Flux
      </span>
      <span style={{
        fontSize: size === 'large' ? 22 : 16,
        fontWeight: 300,
        letterSpacing: '-0.3px',
        color: '#1a1a2e',
        marginLeft: size === 'large' ? -6 : -5,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        API
      </span>
    </div>
  );

  // ========== Mobile Layout ==========
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f7f8fa',
      }}>
        {/* Mobile Top Bar */}
        <div style={{
          padding: '16px 16px 12px',
          background: 'white',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <BrandLogo size="small" />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleCreate}
              style={{
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 12,
                height: 30,
                paddingInline: 12,
              }}
            >
              New
            </Button>
          </div>
          {/* Search */}
          <Input
            placeholder="Search projects..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            size="small"
            style={{ borderRadius: 8, background: '#f7f8fa', height: 34 }}
          />
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          <div style={{
            padding: '8px 14px',
            background: 'white',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            fontSize: 12,
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}>
            <AppstoreOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{projects.length}</span> projects
          </div>
        </div>

        {/* Project List */}
        <div style={{ padding: '0 16px 40px' }}>
          {loading && projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mobile-empty-state">
              <div className="mobile-empty-state-icon">
                <FolderOutlined />
              </div>
              <h3>{searchText ? 'No matching projects' : 'No projects yet'}</h3>
              <p>{searchText ? 'Try a different search term' : 'Create a project to start organizing your API requests'}</p>
              {!searchText && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  size="middle"
                  style={{
                    marginTop: 20,
                    borderRadius: 8,
                    height: 36,
                    paddingInline: 20,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <div
                key={project._id}
                onClick={() => onSelect(project)}
                className="mobile-project-card animate-slide-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="mobile-project-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
                    <FolderOutlined style={{ fontSize: 16 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                      {project.name}
                    </div>
                    {project.description && (
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.description}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 3 }}>
                      {dayjs(project.updatedAt).fromNow()}
                    </div>
                  </div>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: (info) => { info.domEvent.stopPropagation(); handleEdit(project); } },
                        { key: 'delete', danger: true, label: 'Delete', icon: <DeleteOutlined />, onClick: (info) => { info.domEvent.stopPropagation(); handleDelete(project._id); } },
                      ]
                    }}
                  >
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                    >
                      <MoreOutlined style={{ color: '#bfbfbf', fontSize: 16 }} />
                    </div>
                  </Dropdown>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        <Modal
          title={editingProject ? 'Edit Project' : 'New Project'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okButtonProps={{ size: 'small' }}
          cancelButtonProps={{ size: 'small' }}
        >
          <Form form={form} layout="vertical" size="small" style={{ marginTop: 16 }}>
            <Form.Item label="Project Name" name="name" rules={[{ required: true, message: 'Please enter project name' }]}>
              <Input placeholder="My API Project" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Optional description" rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // ========== Desktop - Alibaba Cloud Console Style ==========
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      {/* ===== Top Navbar ===== */}
      <div style={{
        height: 48,
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <BrandLogo size="small" />
          <div style={{ height: 20, width: 1, background: '#e8e8e8' }} />
          <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>API Testing Console</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#8c8c8c', textDecoration: 'none' }}>
            Docs
          </a>
        </div>
      </div>

      {/* ===== Page Header ===== */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '20px 32px 16px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1a2e',
                margin: 0,
                lineHeight: 1.4,
              }}>
                Projects
              </h1>
              <p style={{
                fontSize: 13,
                color: '#8c8c8c',
                margin: '4px 0 0',
                lineHeight: 1.4,
              }}>
                Manage and organize your API testing collections
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="small"
              style={{
                borderRadius: 4,
                fontWeight: 500,
                fontSize: 12,
                height: 28,
                paddingInline: 12,
              }}
            >
              Create Project
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Content Area ===== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px 40px' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
              All Projects
              <span style={{
                fontSize: 12,
                fontWeight: 400,
                color: '#8c8c8c',
                marginLeft: 6,
                padding: '1px 6px',
                background: '#f5f5f5',
                borderRadius: 4,
              }}>
                {filteredProjects.length}
              </span>
            </span>
          </div>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            size="small"
            style={{ width: 220, borderRadius: 4, height: 28, fontSize: 12 }}
          />
        </div>

        {/* Project Table/Cards */}
        {loading && projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 6, border: '1px solid #f0f0f0' }}>
            <Spin />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: 'white',
            borderRadius: 6,
            border: '1px solid #f0f0f0',
          }}>
            <FolderOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 16 }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e', marginBottom: 4 }}>
              {searchText ? 'No matching projects' : 'No projects yet'}
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 20 }}>
              {searchText ? 'Try a different search term' : 'Create your first project to get started'}
            </div>
            {!searchText && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="small"
                style={{ borderRadius: 4, fontSize: 12, height: 28, paddingInline: 12 }}
              >
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: 6,
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 200px 160px 100px',
              padding: '8px 16px',
              background: '#fafafa',
              borderBottom: '1px solid #f0f0f0',
              fontSize: 12,
              fontWeight: 600,
              color: '#8c8c8c',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <span>Project Name</span>
              <span>Description</span>
              <span>Updated</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {/* Table Rows */}
            {filteredProjects.map((project, index) => (
              <div
                key={project._id}
                onClick={() => onSelect(project)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px 160px 100px',
                  padding: '12px 16px',
                  borderBottom: index < filteredProjects.length - 1 ? '1px solid #f5f5f5' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #e6f7ff 0%, #d6e4ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FolderOutlined style={{ fontSize: 13, color: '#1677ff' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1677ff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.4,
                    }}>
                      {project.name}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{
                  fontSize: 12,
                  color: '#8c8c8c',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {project.description || '—'}
                </div>

                {/* Updated */}
                <div style={{ fontSize: 12, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined style={{ fontSize: 11 }} />
                  {dayjs(project.updatedAt).fromNow()}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={(e) => handleEdit(project, e)}
                    style={{ fontSize: 12, width: 24, height: 24, padding: 0, color: '#8c8c8c', borderRadius: 4 }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={(e) => handleDelete(project._id, e)}
                    style={{ fontSize: 12, width: 24, height: 24, padding: 0, borderRadius: 4 }}
                  />
                  <RightOutlined style={{ fontSize: 10, color: '#d9d9d9', marginLeft: 4, alignSelf: 'center' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Modal ===== */}
      <Modal
        title={
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {editingProject ? 'Edit Project' : 'New Project'}
          </span>
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingProject ? 'Update' : 'Create'}
        okButtonProps={{ size: 'small', style: { borderRadius: 4, fontSize: 12, height: 28, paddingInline: 12 } }}
        cancelButtonProps={{ size: 'small', style: { borderRadius: 4, fontSize: 12, height: 28, paddingInline: 12 } }}
        width={480}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form form={form} layout="vertical" size="small">
          <Form.Item
            label={<span style={{ fontSize: 12, fontWeight: 500 }}>Project Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="My API Project" style={{ borderRadius: 4, height: 30, fontSize: 13 }} />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontSize: 12, fontWeight: 500 }}>Description</span>}
            name="description"
          >
            <Input.TextArea
              placeholder="Optional description"
              rows={3}
              style={{ borderRadius: 4, fontSize: 13 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;

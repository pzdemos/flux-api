import React, { useEffect, useState } from 'react';
import { List, Card, Button, Typography, Space, Modal, Form, Input, message } from 'antd';
import {
  FolderOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface ProjectListProps {
  onSelect: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

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

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue(project);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete project?',
      content: 'This will delete all requests in this project.',
      okText: 'Delete',
      okButtonProps: { danger: true },
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={3}>My Projects</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Project
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 3 }}
        loading={loading}
        dataSource={projects}
        renderItem={(project) => (
          <List.Item>
            <Card
              hoverable
              onClick={() => onSelect(project)}
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                />,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project._id);
                  }}
                />,
              ]}
            >
              <Space direction="vertical" className="w-full">
                <Space>
                  <FolderOutlined />
                  <Text strong>{project.name}</Text>
                </Space>
                {project.description && (
                  <Paragraph ellipsis={{ rows: 2 }} type="secondary" className="mb-0">
                    {project.description}
                  </Paragraph>
                )}
                <Text type="secondary" className="text-xs">
                  Updated {dayjs(project.updatedAt).fromNow()}
                </Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      {projects.length === 0 && !loading && (
        <div className="text-center py-20">
          <FolderOutlined className="text-6xl text-gray-300 mb-4" />
          <Typography.Title level={4} type="secondary">
            No projects yet
          </Typography.Title>
          <Text type="secondary">Create a project to start organizing your API requests</Text>
        </div>
      )}

      <Modal
        title={editingProject ? 'Edit Project' : 'New Project'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Project Name"
            name="name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="My API Project" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Optional description"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;

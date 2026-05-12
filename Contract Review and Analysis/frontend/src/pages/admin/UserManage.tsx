import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../../services/userService';

const { Title } = Typography;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

const UserManage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res.users);
    } catch {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await userService.approveUser(userId);
      message.success('用户已批准');
      fetchUsers();
    } catch {
      message.error('批准用户失败');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      message.success('用户已删除');
      fetchUsers();
    } catch {
      message.error('删除用户失败');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({ role: user.role, status: user.status });
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    try {
      const values = await form.validateFields();
      await userService.updateUser(editingUser.id, values);
      message.success('用户信息已更新');
      setEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch {
      message.error('更新用户信息失败');
    }
  };

  const roleColorMap: Record<string, string> = {
    admin: 'red',
    user: 'blue',
  };

  const statusColorMap: Record<string, string> = {
    active: 'green',
    pending: 'orange',
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColorMap[role] || 'default'}>{role}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handleApprove(record.id)}>
              批准
            </Button>
          )}
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>用户管理</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
      />

      <Modal
        title="编辑用户"
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={[
                { label: '管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select
              options={[
                { label: '活跃', value: 'active' },
                { label: '待审核', value: 'pending' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;

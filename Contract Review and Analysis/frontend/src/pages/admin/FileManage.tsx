import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  message,
  Popconfirm,
  Space,
  Typography,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import api from '../../services/api';

const { Title } = Typography;

interface FileItem {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  path: string;
  size: number;
  created_at: string;
}

const categoryMap: Record<string, string> = {
  sales: '销售合同',
  purchase: '采购合同',
  employment: '劳动合同',
  service: '服务合同',
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
};

const FileManage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/files');
      setFiles(res.files);
    } catch {
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = (record: FileItem) => {
    const token = localStorage.getItem('token');
    window.open(`/api/files/download/${record.id}?token=${token}`, '_blank');
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/files/${id}`);
      message.success('删除成功');
      fetchFiles();
    } catch {
      message.error('删除失败');
    }
  };

  const handleCleanTemp = async () => {
    try {
      await api.post('/files/clean-temp');
      message.success('清理临时文件成功');
      fetchFiles();
    } catch {
      message.error('清理临时文件失败');
    }
  };

  const columns: ColumnsType<FileItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (val: string) => (
        <Tag color="blue">{categoryMap[val] ?? val}</Tag>
      ),
    },
    {
      title: '子分类',
      dataIndex: 'subcategory',
      key: 'subcategory',
      width: 140,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (val: number) => formatSize(val),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleDownload(record)}>
            下载
          </Button>
          <Popconfirm
            title="确定删除该文件吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>文件管理</Title>
      <Button style={{ marginBottom: 16 }} onClick={handleCleanTemp}>
        清理临时文件
      </Button>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={files}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default FileManage;

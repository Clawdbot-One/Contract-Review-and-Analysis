import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Table, Tag } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { Title } = Typography;

interface Stats {
  users: { total: number; active: number; pending: number };
  contracts: { total: number; pending: number; auditing: number; approved: number; rejected: number };
  approvals: { total: number; pending: number };
  rules: { total: number };
  reports: { total: number };
  recentUsers: { id: number; username: string; email: string; role: string; status: string; created_at: string }[];
  recentContracts: { id: number; title: string; category: string; status: string; created_at: string }[];
}

const categoryMap: Record<string, string> = {
  sales: '销售合同',
  purchase: '采购合同',
  employment: '劳动合同',
  service: '服务合同',
};

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'orange' },
  auditing: { text: '审核中', color: 'blue' },
  approved: { text: '已审核', color: 'cyan' },
  pending_approval: { text: '待审批', color: 'purple' },
  approved_final: { text: '已审批', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
};

const DataAnalysis: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data as unknown as Stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!stats) {
    return <div>无法获取统计数据</div>;
  }

  const contractTotal = stats.contracts.total || 1;

  const recentUserColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role === 'admin' ? '管理员' : '用户'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'orange'}>{status === 'active' ? '已激活' : '待审批'}</Tag>,
    },
  ];

  const recentContractColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => categoryMap[cat] || cat,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={2}>数据分析</Title>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.users.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总合同数"
              value={stats.contracts.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="审核报告"
              value={stats.reports.total}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="审核规则"
              value={stats.rules.total}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="合同状态分布">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="待审核"
                  value={stats.contracts.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="审核中"
                  value={stats.contracts.auditing}
                  prefix={<AuditOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已通过"
                  value={stats.contracts.approved}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Statistic
                  title="已驳回"
                  value={stats.contracts.rejected}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="通过率"
                  value={stats.contracts.total > 0 ? Math.round((stats.contracts.approved / contractTotal) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="驳回率"
                  value={stats.contracts.total > 0 ? Math.round((stats.contracts.rejected / contractTotal) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="用户统计">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="活跃用户"
                  value={stats.users.active}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="待审批用户"
                  value={stats.users.pending}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="待审批合同"
                  value={stats.approvals.pending}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="最近注册用户">
            <Table
              columns={recentUserColumns}
              dataSource={stats.recentUsers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近上传合同">
            <Table
              columns={recentContractColumns}
              dataSource={stats.recentContracts}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataAnalysis;

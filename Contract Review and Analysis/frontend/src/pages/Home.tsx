import React from 'react';
import { Card, Statistic, Row, Col, Typography, Button } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { contracts } = useSelector((state: RootState) => state.contract);

  // 模拟数据
  const stats = {
    totalContracts: contracts.length || 128,
    pendingApprovals: 15,
    completedContracts: 89,
    approvalRate: '92%',
  };

  return (
    <div>
      <Title level={2}>欢迎使用合同评审系统</Title>
      <Paragraph>您好，{user?.username}，这是您的工作台。</Paragraph>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总合同数"
              value={stats.totalContracts}
              prefix="📄"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批"
              value={stats.pendingApprovals}
              prefix="⏳"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completedContracts}
              prefix="✅"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="审批通过率"
              value={stats.approvalRate}
              prefix="📊"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="快速操作" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/contract/upload">
                <Button type="primary">上传合同</Button>
              </Link>
              <Link to="/contract/list">
                <Button>查看合同列表</Button>
              </Link>
              <Link to="/approval/my">
                <Button>我的审批</Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/users">
                  <Button>管理用户</Button>
                </Link>
              )}
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="系统通知" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontWeight: 'bold' }}>系统更新通知</div>
                <div style={{ fontSize: 14, color: '#666' }}>2026-04-27</div>
                <div style={{ marginTop: 8 }}>系统已更新至最新版本，新增AI智能审核功能。</div>
              </div>
              <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontWeight: 'bold' }}>审批提醒</div>
                <div style={{ fontSize: 14, color: '#666' }}>2026-04-26</div>
                <div style={{ marginTop: 8 }}>您有3个待审批的合同，请及时处理。</div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 'bold' }}>合同到期提醒</div>
                <div style={{ fontSize: 14, color: '#666' }}>2026-04-25</div>
                <div style={{ marginTop: 8 }}>有2个合同将在7天后到期，请提前准备续签事宜。</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
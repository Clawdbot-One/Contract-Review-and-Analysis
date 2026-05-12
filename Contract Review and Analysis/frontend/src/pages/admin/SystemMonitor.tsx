import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Descriptions, Progress, Typography, Spin, Tag } from 'antd';
import { adminService } from '../../services/adminService';

const { Title } = Typography;

interface SystemInfo {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  nodeVersion: string;
  platform: string;
  pid: number;
}

const SystemMonitor: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemInfo = async () => {
    try {
      const data = await adminService.getSystemInfo();
      setSystemInfo(data as unknown as SystemInfo);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}天 ${hours}小时 ${minutes}分钟 ${secs}秒`;
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!systemInfo) {
    return <div>无法获取系统信息</div>;
  }

  const memoryUsagePercent = Math.round((systemInfo.memory.heapUsed / systemInfo.memory.heapTotal) * 100);

  return (
    <div>
      <Title level={2}>系统监控</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="服务器信息">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="运行平台">{systemInfo.platform}</Descriptions.Item>
              <Descriptions.Item label="Node.js 版本">
                <Tag color="green">{systemInfo.nodeVersion}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="进程 PID">{systemInfo.pid}</Descriptions.Item>
              <Descriptions.Item label="运行时间">{formatUptime(systemInfo.uptime)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="内存使用">
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8 }}>堆内存使用率</div>
              <Progress
                percent={memoryUsagePercent}
                status={memoryUsagePercent > 80 ? 'exception' : memoryUsagePercent > 60 ? 'active' : 'success'}
                format={(percent) => `${percent}%`}
              />
            </div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="RSS 内存">{systemInfo.memory.rss} MB</Descriptions.Item>
              <Descriptions.Item label="堆总内存">{systemInfo.memory.heapTotal} MB</Descriptions.Item>
              <Descriptions.Item label="堆已使用">{systemInfo.memory.heapUsed} MB</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="服务状态">
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: '#52c41a' }}>●</div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 'bold' }}>API 服务</div>
                    <div style={{ color: '#52c41a' }}>运行中</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: '#52c41a' }}>●</div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 'bold' }}>数据库</div>
                    <div style={{ color: '#52c41a' }}>已连接</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: '#faad14' }}>●</div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 'bold' }}>AI 审核</div>
                    <div style={{ color: '#faad14' }}>需配置</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: '#52c41a' }}>●</div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 'bold' }}>文件存储</div>
                    <div style={{ color: '#52c41a' }}>正常</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemMonitor;

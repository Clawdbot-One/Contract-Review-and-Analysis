import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    department: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await userService.register({
        username: values.username,
        email: values.email,
        password: values.password,
        department: values.department,
      });
      message.success('注册成功，请等待管理员审批');
      window.location.href = '/login';
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>用户注册</Title>
        <Form
          name="register"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>
          <Form.Item
            name="department"
            rules={[{ required: true, message: '请输入所属部门' }]}
          >
            <Input prefix={<TeamOutlined />} placeholder="所属部门" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              注册
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Link to="/login">已有账号？去登录</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
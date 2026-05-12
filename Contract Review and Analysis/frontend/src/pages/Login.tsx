import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginSuccess } from '../store/userSlice';
import { userService } from '../services/userService';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await userService.login(values);
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));
      localStorage.setItem('token', response.token);
      message.success('登录成功');
      navigate('/home');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>合同评审系统</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              登录
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Link to="/register">注册新用户</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
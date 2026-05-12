import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loginSuccess } from './store/userSlice';
import { userService } from './services/userService';
import type { RootState } from './store';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await userService.getCurrentUser();
          dispatch(loginSuccess({
            user: response.user,
            token: token,
          }));
        } catch (error) {
          localStorage.removeItem('token');
          dispatch(logout());
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    message.success('退出登录成功');
    navigate('/login');
  };

  const dropdownMenu = [
    {
      key: 'profile',
      label: '个人设置',
    },
    {
      key: 'logout',
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const noLayoutPages = ['/login', '/register'];
  if (noLayoutPages.includes(location.pathname)) {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const menuItems = [
    {
      key: '/home',
      label: '首页',
    },
    {
      key: '/contract',
      label: '合同管理',
      children: [
        {
          key: '/contract/upload',
          label: '上传合同',
        },
        {
          key: '/contract/list',
          label: '合同列表',
        },
      ],
    },
    {
      key: '/approval',
      label: '审批管理',
      children: [
        {
          key: '/approval/my',
          label: '我的审批',
        },
      ],
    },
    ...(user?.role === 'admin' ? [
      {
        key: '/admin',
        label: '后台管理',
        children: [
          {
            key: '/admin/users',
            label: '用户管理',
          },
          {
            key: '/admin/rules',
            label: '规则管理',
          },
          {
            key: '/admin/files',
            label: '文件管理',
          },
          {
            key: '/admin/monitoring',
            label: '系统监控',
          },
          {
            key: '/admin/analysis',
            label: '数据分析',
          },
        ],
      },
    ] : []),
  ];

  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];
    if (path.startsWith('/contract')) openKeys.push('/contract');
    if (path.startsWith('/approval')) openKeys.push('/approval');
    if (path.startsWith('/admin')) openKeys.push('/admin');
    return openKeys;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>合同评审系统</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '16px', color: 'white' }}>{user?.username}</span>
          <Dropdown menu={{ items: dropdownMenu }}>
            <Avatar>{user?.username.charAt(0)}</Avatar>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;

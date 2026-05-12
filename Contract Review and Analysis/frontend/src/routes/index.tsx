import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ContractUpload from '../pages/ContractUpload';
import ContractList from '../pages/ContractList';
import UserManage from '../pages/admin/UserManage';
import RuleManage from '../pages/admin/RuleManage';
import FileManage from '../pages/admin/FileManage';
import SystemMonitor from '../pages/admin/SystemMonitor';
import DataAnalysis from '../pages/admin/DataAnalysis';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/contract',
        children: [
          {
            path: 'upload',
            element: <ContractUpload />,
          },
          {
            path: 'list',
            element: <ContractList />,
          },
        ],
      },
      {
        path: '/admin',
        children: [
          {
            path: 'users',
            element: <UserManage />,
          },
          {
            path: 'rules',
            element: <RuleManage />,
          },
          {
            path: 'files',
            element: <FileManage />,
          },
          {
            path: 'monitoring',
            element: <SystemMonitor />,
          },
          {
            path: 'analysis',
            element: <DataAnalysis />,
          },
        ],
      },
    ],
  },
]);

export default router;

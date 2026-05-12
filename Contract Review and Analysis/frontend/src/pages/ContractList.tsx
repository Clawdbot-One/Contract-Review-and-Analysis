import React, { useEffect, useState } from 'react';
import { Table, Select, DatePicker, Button, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setContracts, setLoading, setError } from '../store/contractSlice';
import { contractService } from '../services/contractService';
import type { RootState } from '../store';
import { Link } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ContractList: React.FC = () => {
  const dispatch = useDispatch();
  const { contracts, loading } = useSelector((state: RootState) => state.contract);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateRange: null as any,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    dispatch(setLoading(true));
    try {
      const response = await contractService.getContracts({
        status: filters.status,
        category: filters.category,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      });
      dispatch(setContracts(response.contracts));
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || '获取合同列表失败'));
      message.error('获取合同列表失败');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    fetchContracts();
  };

  const handleReset = () => {
    setFilters({
      status: '',
      category: '',
      dateRange: null,
    });
    fetchContracts();
  };

  const columns = [
    {
      title: '合同标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Link to={`/contract/detail/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => {
        const categoryMap: { [key: string]: string } = {
          sales: '销售合同',
          purchase: '采购合同',
          employment: '劳动合同',
          service: '服务合同',
        };
        return categoryMap[text] || text;
      },
    },
    {
      title: '子分类',
      dataIndex: 'subcategory',
      key: 'subcategory',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const statusMap: { [key: string]: string } = {
          'pending': '待审核',
          'auditing': '审核中',
          'approved': '已审核',
          'pending_approval': '待审批',
          'approved_final': '已审批',
          'rejected': '已驳回',
        };
        return statusMap[text] || text;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => (
          <div>
            <Link to={`/contract/detail/${record.id}`}>
              <Button type="link">查看</Button>
            </Link>
          </div>
        ),
      },
  ];

  // 模拟数据
  const mockContracts = [
    {
      id: '1',
      title: '产品销售合同',
      category: 'sales',
      subcategory: 'product',
      status: 'pending_approval',
      created_at: '2026-04-26',
    },
    {
      id: '2',
      title: '设备采购合同',
      category: 'purchase',
      subcategory: 'equipment',
      status: 'approved_final',
      created_at: '2026-04-25',
    },
    {
      id: '3',
      title: '全职劳动合同',
      category: 'employment',
      subcategory: 'fulltime',
      status: 'auditing',
      created_at: '2026-04-24',
    },
  ];

  const displayContracts = contracts.length > 0 ? contracts : mockContracts;

  return (
    <div>
      <Title level={2}>合同列表</Title>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Select
          placeholder="状态"
          style={{ width: 120 }}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
        >
          <Option value="">全部</Option>
          <Option value="pending">待审核</Option>
          <Option value="auditing">审核中</Option>
          <Option value="approved">已审核</Option>
          <Option value="pending_approval">待审批</Option>
          <Option value="approved_final">已审批</Option>
          <Option value="rejected">已驳回</Option>
        </Select>
        <Select
          placeholder="分类"
          style={{ width: 120 }}
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
        >
          <Option value="">全部</Option>
          <Option value="sales">销售合同</Option>
          <Option value="purchase">采购合同</Option>
          <Option value="employment">劳动合同</Option>
          <Option value="service">服务合同</Option>
        </Select>
        <RangePicker
          style={{ width: 300 }}
          value={filters.dateRange}
          onChange={(dates) => handleFilterChange('dateRange', dates)}
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button onClick={handleReset}>重置</Button>
      </div>
      <Table
        columns={columns}
        dataSource={displayContracts}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default ContractList;
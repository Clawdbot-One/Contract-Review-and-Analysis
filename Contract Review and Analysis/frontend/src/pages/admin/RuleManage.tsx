import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminService } from '../../services/adminService';

const { Title } = Typography;
const { TextArea } = Input;

interface Rule {
  id: number;
  category: string;
  subcategory: string;
  rule_name: string;
  rule_content: string;
  created_at: string;
  updated_at: string;
}

const categoryMap: Record<string, string> = {
  sales: '销售合同',
  purchase: '采购合同',
  employment: '劳动合同',
  service: '服务合同',
};

const RuleManage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [form] = Form.useForm();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRules();
      setRules(res.rules);
    } catch {
      message.error('获取规则列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAdd = () => {
    setEditingRule(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: Rule) => {
    setEditingRule(record);
    form.setFieldsValue({
      category: record.category,
      subcategory: record.subcategory,
      rule_name: record.rule_name,
      rule_content: record.rule_content,
    });
    setModalOpen(true);
  };

  const handleDelete = async (ruleId: number) => {
    try {
      await adminService.deleteRule(String(ruleId));
      message.success('删除成功');
      fetchRules();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRule) {
        await adminService.updateRule(String(editingRule.id), values);
        message.success('更新成功');
      } else {
        await adminService.createRule(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchRules();
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<Rule> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (val: string) => categoryMap[val] ?? val,
    },
    {
      title: '子分类',
      dataIndex: 'subcategory',
      key: 'subcategory',
      width: 140,
    },
    {
      title: '规则名称',
      dataIndex: 'rule_name',
      key: 'rule_name',
      width: 180,
    },
    {
      title: '规则内容',
      dataIndex: 'rule_content',
      key: 'rule_content',
      ellipsis: true,
      render: (val: string) => val?.length > 50 ? `${val.slice(0, 50)}...` : val,
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
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该规则吗？"
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
      <Title level={3}>规则管理</Title>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={handleAdd}>
        新增规则
      </Button>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rules}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingRule ? '编辑规则' : '新增规则'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {Object.entries(categoryMap).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="subcategory"
            label="子分类"
            rules={[{ required: true, message: '请输入子分类' }]}
          >
            <Input placeholder="请输入子分类" />
          </Form.Item>
          <Form.Item
            name="rule_name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item
            name="rule_content"
            label="规则内容"
            rules={[{ required: true, message: '请输入规则内容' }]}
          >
            <TextArea rows={4} placeholder="请输入规则内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RuleManage;

import React, { useState } from 'react';
import { Form, Input, Select, Upload, Button, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { contractService } from '../services/contractService';
import { useDispatch } from 'react-redux';
import { addContract } from '../store/contractSlice';

const { Title } = Typography;

const ContractUpload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const dispatch = useDispatch();

  // 模拟合同分类数据
  const categories = [
    { value: 'sales', label: '销售合同' },
    { value: 'purchase', label: '采购合同' },
    { value: 'employment', label: '劳动合同' },
    { value: 'service', label: '服务合同' },
  ];

  const subcategories = {
    sales: [
      { value: 'product', label: '产品销售' },
      { value: 'service', label: '服务销售' },
    ],
    purchase: [
      { value: 'raw', label: '原材料采购' },
      { value: 'equipment', label: '设备采购' },
    ],
    employment: [
      { value: 'fulltime', label: '全职合同' },
      { value: 'parttime', label: '兼职合同' },
    ],
    service: [
      { value: 'consulting', label: '咨询服务' },
      { value: 'maintenance', label: '维护服务' },
    ],
  };

  const [form] = Form.useForm();

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
  };

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('请上传合同文件');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('category', values.category);
      formData.append('subcategory', values.subcategory);
      formData.append('description', values.description || '');
      formData.append('file', fileList[0].originFileObj);

      const response = await contractService.uploadContract(formData);
      dispatch(addContract(response.contract));
      message.success('合同上传成功');
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      message.error(error.response?.data?.message || '合同上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>上传合同</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="合同标题"
          rules={[{ required: true, message: '请输入合同标题' }]}
        >
          <Input placeholder="请输入合同标题" />
        </Form.Item>

        <Form.Item
          name="category"
          label="合同分类"
          rules={[{ required: true, message: '请选择合同分类' }]}
        >
          <Select placeholder="请选择合同分类">
            {categories.map((category) => (
              <Select.Option key={category.value} value={category.value}>
                {category.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="subcategory"
          label="合同子分类"
          rules={[{ required: true, message: '请选择合同子分类' }]}
        >
          <Select placeholder="请选择合同子分类">
            {form.getFieldValue('category') && subcategories[form.getFieldValue('category') as keyof typeof subcategories]?.map((subcategory: { value: string; label: string }) => (
              <Select.Option key={subcategory.value} value={subcategory.value}>
                {subcategory.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="合同描述"
        >
          <Input.TextArea rows={4} placeholder="请输入合同描述（可选）" />
        </Form.Item>

        <Form.Item
          name="file"
          label="合同文件"
          rules={[{ required: true, message: '请上传合同文件' }]}
        >
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            支持 PDF、Word、Excel 等格式文件
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ContractUpload;
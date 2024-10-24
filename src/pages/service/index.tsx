import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { Table, Button, message, Popconfirm, Modal, Input, Form } from "antd";
import Layout from "@/components/Layout";
import db from "../../db";
import request from '../../request'; // 确保 request 是你自己定义的或使用 fetch

interface Service {
  id: number;
  service_name: string;
  price: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ServicesProps {
  services: Service[];
}

const ServicesPage: React.FC<ServicesProps> = ({ services }) => {
  const [serviceList, setServiceList] = useState<Service[]>(services); // 服务列表
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制新增/编辑表单的可见性
  const [editingService, setEditingService] = useState<Service | null>(null); // 当前编辑的服务
  const [form] = Form.useForm(); // 表单

  // 新增服务
  const handleAddService = async (values: any) => {
    try {
      const response = await request('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      // API 返回的是所有服务的列表
      const updatedServices: Service[] = response; // 假设返回的是更新后的服务列表

      // 更新服务列表
      setServiceList(updatedServices);

      message.success("新增服务成功！");
      setIsModalVisible(false);
      form.resetFields(); // 重置表单
    } catch (error: any) {
      console.error("新增服务失败:", error);
      message.error(error.message || '新增服务失败，请稍后再试。');
    }
  };

  // 编辑服务
  const handleEditService = async (values: any) => {
    if (!editingService) return;

    try {
      const response = await request(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const updatedServices: Service[] = response; // 假设返回的是更新后的服务列表

      // 更新服务列表
      setServiceList(updatedServices);

      message.success("编辑服务成功！");
      setIsModalVisible(false);
      setEditingService(null);
      form.resetFields(); // 重置表单
    } catch (error: any) {
      console.error("编辑服务失败:", error);
      message.error(error.message || '编辑服务失败，请稍后再试。');
    }
  };

  // 删除服务
  const handleDelete = async (id: number) => {
    try {
      await request(`/api/services/${id}`, {
        method: 'DELETE',
      });

      // 从列表中移除删除的服务
      setServiceList(serviceList.filter((service) => service.id !== id));

      message.success('服务删除成功！');
    } catch (error: any) {
      console.error("删除服务失败:", error);
      message.error(error.message || '删除服务失败，请稍后再试。');
    }
  };

  // 打开新增/编辑弹窗
  const showModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.setFieldsValue({
        service_name: service.service_name,
        price: service.price,
        description: service.description,
      });
    } else {
      setEditingService(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Layout>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
        新增服务
      </Button>

      {/* 服务列表表格 */}
      <Table dataSource={serviceList} rowKey="id">
        <Table.Column title="ID" dataIndex="id" />
        <Table.Column title="服务项目" dataIndex="service_name" />
        <Table.Column
          title="检验费用"
          dataIndex="price"
          render={(price) => `¥${Number(price).toFixed(2)}`}
        />
        <Table.Column title="检验说明" dataIndex="description" render={(text) => text || "无描述"} />
        <Table.Column
          title="创建时间"
          dataIndex="created_at"
          render={(text) => new Date(text).toLocaleString()}
        />
        <Table.Column
          title="更新时间"
          dataIndex="updated_at"
          render={(text) => new Date(text).toLocaleString()}
        />
        <Table.Column
          title="操作"
          render={(_, record: Service) => (
            <>
              <Button type="link" onClick={() => showModal(record)}>
                编辑
              </Button>
              <Popconfirm
                title="确定删除此服务吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger style={{ marginLeft: 8 }}>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        />
      </Table>

      {/* 弹出新增/编辑表单 */}
      <Modal
        title={editingService ? "编辑服务" : "新增服务"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={editingService ? handleEditService : handleAddService}>
          <Form.Item
            label="服务项目"
            name="service_name"
            rules={[{ required: true, message: '请输入服务项目名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="检验费用"
            name="price"
            rules={[{ required: true, message: '请输入检验费用!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="检验说明"
            name="description"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingService ? "更新" : "新增"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

// 服务端渲染，获取服务数据
export const getServerSideProps: GetServerSideProps = async () => {
  const result = await db("services")
    .select("*")
    .orderBy('created_at', 'desc'); // 从数据库获取服务，并按创建时间降序

  // 格式化日期
  const services = result.map(service => ({
    ...service,
    created_at: service.created_at.toLocaleString(),
    updated_at: service.updated_at.toLocaleString()
  }));

  return {
    props: {
      services,
    },
  };
};

export default ServicesPage;

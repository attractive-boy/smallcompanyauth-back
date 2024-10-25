import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import request from "../../request";
import db from "../../db"; // 引入数据库连接

interface Admin {
  id: number;
  username: string;
  created_at: string;
}

interface AdminsPageProps {
  admins: Admin[];
}

const AdminsPage: React.FC<AdminsPageProps> = ({ admins }) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制重置密码弹窗
  const [isczModalVisible, setIsczModalVisible] = useState(false); // 控制重置密码弹窗
  const [resetId, setResetId] = useState<number | null>(null); // 用来存储重置密码的管理员 ID
  const [form] = Form.useForm(); // 重置密码表单实例
  const [form1] = Form.useForm();
  const [adminList, setAdminList] = useState<Admin[]>(admins); // 管理员列表

  // 显示重置密码弹窗并传递管理员 ID
  const showModal = (id: number) => {
    setResetId(id);
    setIsczModalVisible(true);
  };

  // 关闭重置密码弹窗
  const handleCancel = () => {
    setIsczModalVisible(false);
    form.resetFields(); // 清空重置密码表单
  };

  // 提交重置密码表单
  const handleOk = async () => {
    if (!resetId) {
      message.error("无法找到管理员 ID！");
      return;
    }

    try {
      const values = await form.validateFields(); // 验证表单

      // 发送 POST 请求到 API 路由，重置管理员密码
      const response = await request(`/api/reset-password/${resetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: values.password }),
      });

      // 显示成功消息
      message.success('密码重置成功！');

      // 关闭重置密码弹窗并重置表单
      handleCancel();
    } catch (error: any) {
      console.error("重置密码失败:", error);
      message.error(error.message || '重置密码失败，请稍后再试。');
    }
  };

  // 删除管理员
  const handleDelete = async (id: number) => {
    try {
      // 发送 DELETE 请求到 API 路由
      await request(`/api/admins/${id}`, {
        method: 'DELETE',
      });

      // 更新管理员列表，移除被删除的管理员
      setAdminList(adminList.filter((admin) => admin.id !== id));

      // 显示成功消息
      message.success('管理员删除成功！');
    } catch (error: any) {
      console.error("删除管理员失败:", error);
      message.error(error.message || '删除管理员失败，请稍后再试。');
    }
  };

  // 新增管理员
  const handleAddAdmin = () => {
    setIsModalVisible(true); // 打开新增管理员弹窗
  };

  // 提交新增管理员表单
  const handleAddAdminOk = async () => {
    try {
      const values = await form1.validateFields(); // 验证表单

      // 发送 POST 请求到 API 路由，新增管理员
      const response = await request(`/api/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: values.username, password: values.password }),
      });

      // 添加新管理员到列表中
      const newAdmin: Admin = {
        id: response.userId,
        username: values.username,
        created_at: new Date().toLocaleString(), // 假设使用当前时间
      };

      setAdminList([...adminList, newAdmin]);

      // 显示成功消息
      message.success('管理员添加成功！');

      // 关闭新增管理员弹窗并重置表单
      handleCancel();
    } catch (error: any) {
      console.error("添加管理员失败:", error);
      message.error(error.message || '添加管理员失败，请稍后再试。');
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 20 }}>
        <Button type="primary" onClick={handleAddAdmin} style={{ marginBottom: 16 }}>
          新增管理员
        </Button>
      </div>

      <Table dataSource={adminList} rowKey="id" style={{ marginBottom: 20 }}>
        <Table.Column title="昵称" dataIndex="username" />
        <Table.Column
          title="创建时间"
          dataIndex="created_at"
          render={(text) => new Date(text).toLocaleString()}
        />
        <Table.Column
          title="操作"
          render={(_, record: Admin) => (
            <>
              <Button
                type="link"
                onClick={() => showModal(record.id)} // 传递管理员 ID
                style={{ marginRight: 8 }}
              >
                重置密码
              </Button>
              <Popconfirm
                title="确定删除此管理员吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        />
      </Table>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置管理员密码"
        visible={isczModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增管理员弹窗 */}
      <Modal
        title="新增管理员"
        visible={isModalVisible}
        onOk={handleAddAdminOk}
        onCancel={handleCancel}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form1} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

// 服务端渲染，获取管理员数据
export const getServerSideProps: GetServerSideProps = async () => {
  const admins = (await db("users").select("*")).filter(e => e.openid.length === 36);

  return {
    props: {
      admins: admins.map((admin: any) => ({
        id: admin.id,
        username: admin.username,
        created_at: new Date(admin.created_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
      })),
    },
  };
};

export default AdminsPage;

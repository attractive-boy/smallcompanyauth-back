// pages/announcements.tsx

import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import Layout from "@/components/Layout";
import db from "../../db";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import request from '../../request';

// 动态导入 ReactQuill，避免 SSR 问题
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string; // 创建时间
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

const AnnouncementsPage: React.FC<AnnouncementsProps> = ({ announcements }) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制新增弹窗
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // 控制编辑弹窗
  const [form] = Form.useForm(); // 新增表单实例
  const [editForm] = Form.useForm(); // 编辑表单实例
  const [editorContent, setEditorContent] = useState(""); // 新增富文本内容
  const [editEditorContent, setEditEditorContent] = useState(""); // 编辑富文本内容
  const [announcementList, setAnnouncementList] = useState<Announcement[]>(announcements); // 公告列表
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null); // 当前编辑的公告

  // 显示新增弹窗
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 关闭新增弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); // 清空新增表单
    setEditorContent(""); // 重置富文本内容
  };

  // 显示编辑弹窗
  const showEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      title: announcement.title,
    });
    setEditEditorContent(announcement.content);
  };

  // 关闭编辑弹窗
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingAnnouncement(null);
    editForm.resetFields(); // 清空编辑表单
    setEditEditorContent(""); // 重置编辑富文本内容
  };

  // 提交新增表单
  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // 验证新增表单

      if (!editorContent || editorContent.trim() === "") {
        message.error('公告内容不能为空。');
        return;
      }

      // 构建新增公告数据
      const payload = {
        title: values.title,
        content: editorContent,
      };

      // 发送 POST 请求到 API 路由
      const response = await request('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const newAnnouncement: Announcement = response;

      // 更新公告列表，添加新公告到顶部
      setAnnouncementList([newAnnouncement, ...announcementList]);

      // 显示成功消息
      message.success('公告新增成功！');

      // 关闭新增弹窗并重置表单
      handleCancel();
    } catch (error: any) {
      console.error("新增公告失败:", error);
      // 显示错误消息
      message.error(error.message || '新增公告失败，请稍后再试。');
    }
  };

  // 提交编辑表单
  const handleEditOk = async () => {
    if (!editingAnnouncement) {
      message.error('未选择要编辑的公告。');
      return;
    }

    try {
      const values = await editForm.validateFields(); // 验证编辑表单

      if (!editEditorContent || editEditorContent.trim() === "") {
        message.error('公告内容不能为空。');
        return;
      }

      // 构建编辑公告数据
      const payload = {
        title: values.title,
        content: editEditorContent,
      };

      // 发送 PUT 请求到 API 路由
      const response = await request(`/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });


      const updatedAnnouncement: Announcement =  response;

      // 更新公告列表
      setAnnouncementList(
        announcementList.map((ann) =>
          ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann
        )
      );

      // 显示成功消息
      message.success('公告编辑成功！');

      // 关闭编辑弹窗并重置表单
      handleEditCancel();
    } catch (error: any) {
      console.error("编辑公告失败:", error);
      // 显示错误消息
      message.error(error.message || '编辑公告失败，请稍后再试。');
    }
  };

  // 删除公告
  const handleDelete = async (id: number) => {
    try {
      // 发送 DELETE 请求到 API 路由
      const response = await request(`/api/announcements/${id}`, {
        method: 'DELETE',
      });
      // 更新公告列表，移除被删除的公告
      setAnnouncementList(announcementList.filter((ann) => ann.id !== id));

      // 显示成功消息
      message.success('公告删除成功！');
    } catch (error: any) {
      console.error("删除公告失败:", error);
      // 显示错误消息
      message.error(error.message || '删除公告失败，请稍后再试。');
    }
  };
  console.log(announcements);
  return (
    <Layout>
      {/* 新增公告按钮 */}
      <Button type="primary" style={{ marginBottom: "20px" }} onClick={showModal}>
        新增公告
      </Button>

      {/* 公告列表表格 */}
      <Table dataSource={announcementList} rowKey="id">
        <Table.Column title="标题" dataIndex="title" />
        <Table.Column
          title="创建时间"
          dataIndex="created_at"
          render={(text) => new Date(text).toLocaleString()}
        />
        <Table.Column
          title="操作"
          render={(_, record: Announcement) => (
            <>
              <Button
                type="link"
                onClick={() => showEditModal(record)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定删除此公告吗？"
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

      {/* 新增公告弹窗 */}
      <Modal
        title="新增公告"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="公告标题"
            rules={[{ required: true, message: "请输入公告标题" }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            label="公告内容"
            required
          >
            <ReactQuill
              value={editorContent}
              onChange={setEditorContent}
              placeholder="请输入公告内容"
            />
            { !editorContent && <div style={{ color: 'red', marginTop: '5px' }}>请输入公告内容</div> }
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑公告弹窗 */}
      <Modal
        title="编辑公告"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="公告标题"
            rules={[{ required: true, message: "请输入公告标题" }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            label="公告内容"
            required
          >
            <ReactQuill
              value={editEditorContent}
              onChange={setEditEditorContent}
              placeholder="请输入公告内容"
            />
            { !editEditorContent && <div style={{ color: 'red', marginTop: '5px' }}>请输入公告内容</div> }
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

// 服务端渲染，获取公告数据
export const getServerSideProps: GetServerSideProps = async () => {
  const result = await db("announcements")
    .select("*")
    .orderBy('created_at', 'desc'); // 从数据库获取公告，并按创建时间降序
    // 格式化日期
  const announcements = result.map(result => ({
    ...result,
    created_at: result.created_at.toLocaleString(),
    updated_at: result.updated_at.toLocaleString()
  }));
  return {
    props: {
      announcements,
    },
  };
};

export default AnnouncementsPage;

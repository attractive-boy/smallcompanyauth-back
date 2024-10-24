// pages/api/announcements/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db'; // 根据你的项目结构调整路径

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // 验证 id 是否为数字
  if (Array.isArray(id) || isNaN(Number(id))) {
    return res.status(400).json({ error: '无效的公告 ID。' });
  }

  const announcementId = Number(id);

  if (req.method === 'PUT') {
    const { title, content } = req.body;

    // 验证请求体
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容是必填项。' });
    }

    try {
      // 更新公告
      const affectedRows = await db('announcements')
        .where({ id: announcementId })
        .update({
          title,
          content,
        });

      if (affectedRows === 0) {
        return res.status(404).json({ error: '公告未找到。' });
      }

      // 获取更新后的公告
      const updatedAnnouncement = await db('announcements').where({ id: announcementId }).first();

      return res.status(200).json(updatedAnnouncement);
    } catch (error) {
      console.error('编辑公告时出错:', error);
      return res.status(500).json({ error: '服务器内部错误。' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // 删除公告
      const affectedRows = await db('announcements').where({ id: announcementId }).del();

      if (affectedRows === 0) {
        return res.status(404).json({ error: '公告未找到。' });
      }

      return res.status(200).json({ message: '公告删除成功。' });
    } catch (error) {
      console.error('删除公告时出错:', error);
      return res.status(500).json({ error: '服务器内部错误。' });
    }
  } else if (req.method === 'GET') {
    try {
      // 获取公告
      const announcement = await db('announcements').where({ id: announcementId }).first();

      if (!announcement) {
        return res.status(404).json({ error: '公告未找到。' });
      }

      return res.status(200).json(announcement);
    } catch (error) {
      console.error('获取公告时出错:', error);
    }
  }
   else {
    // 处理不支持的 HTTP 方法
    res.setHeader('Allow', ['PUT', 'DELETE','GET']);
    return res.status(405).end(`方法 ${req.method} 不被允许。`);
  }
}

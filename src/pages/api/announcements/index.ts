// pages/api/announcements/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db'; // 根据你的项目结构调整路径

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, content } = req.body;

    // 验证请求体
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容是必填项。' });
    }

    try {
      // 插入新公告，并返回插入后的 ID
      const [id] = await db('announcements').insert({
        title,
        content
      });

      // 获取新插入的公告
      const newAnnouncement = await db('announcements').where({ id }).first();

      return res.status(201).json(newAnnouncement);
    } catch (error) {
      console.error('新增公告时出错:', error);
      return res.status(500).json({ error: '服务器内部错误。' });
    }
  } else if (req.method === 'GET') {
    try {
      // 获取所有公告
      const announcements = await db('announcements').select('id', 'title', 'updated_at');
      announcements.forEach(announcement => {
        announcement.updated_at = announcement.updated_at.toLocaleDateString().replaceAll('/', '-')
      });
      return res.status(200).json(announcements);
    } catch (error) {
      console.error('获取公告时出错:', error);
      return res.status(500).json({ error: '服务器内部错误。' });
    }
  } 
  else {
    // 处理不支持的 HTTP 方法
    res.setHeader('Allow', ['POST','GET']);
    return res.status(405).end(`方法 ${req.method} 不被允许。`);
  }
}

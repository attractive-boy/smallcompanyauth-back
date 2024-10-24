// pages/api/reset-password/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db'; // 引入数据库连接
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // 从URL中获取管理员的ID

  if (req.method === 'POST') {
    try {
      const { password } = req.body;

      // 验证密码
      if (!password) {
        return res.status(400).json({ message: '密码不能为空' });
      }

      // 使用bcrypt加密新密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 更新管理员密码
      const result = await db('users')
        .where('id', id)
        .update({
          password_hash: hashedPassword,
          updated_at: new Date(),
        });

      if (result === 0) {
        return res.status(404).json({ message: '管理员未找到' });
      }

      return res.status(200).json({ message: '密码重置成功' });
    } catch (error) {
      console.error('重置密码失败:', error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    // 仅支持 POST 请求
    return res.status(405).json({ message: '方法不允许' });
  }
}

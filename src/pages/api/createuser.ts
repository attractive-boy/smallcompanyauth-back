// pages/api/createUser.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // 导入 UUID 生成器
import db from '../../db'; // 假设你的数据库连接文件

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method, req.url);
  if (req.method === 'POST') {
    const { username, password, } = req.body;

    // 输入验证
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    // 生成 UUID
    const openid = uuidv4(); // 生成随机 UUID

    try {
      // 哈希密码
      const passwordHash = await bcrypt.hash(password, 10);

      // 插入用户到数据库
      const [result] = await db('users')
        .insert({
          username,
          password_hash: passwordHash,
          openid
        });

      return res.status(201).json({ message: '用户创建成功', userId: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    return res.status(405).json({ message: '方法不允许' });
  }
}

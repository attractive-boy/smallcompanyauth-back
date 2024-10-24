// pages/api/admins/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db'; // 引入数据库连接

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // 从URL中获取管理员的ID

  if (req.method === 'DELETE') {
    try {
      // 删除管理员
      const result = await db('users')
        .where('id', id)
        .del();

      if (result === 0) {
        return res.status(404).json({ message: '管理员未找到' });
      }

      return res.status(200).json({ message: '管理员删除成功' });
    } catch (error) {
      console.error('删除管理员失败:', error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    // 仅支持 DELETE 请求
    return res.status(405).json({ message: '方法不允许' });
  }
}

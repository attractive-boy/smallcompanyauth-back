import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db'; // 假设你的数据库连接文件

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id; // 从 URL 中获取 id 参数
  if (req.method === 'PUT') {
    

    try {
      const fieldsToUpdate = req.body; // 从请求体中获取所有字段

      // 验证输入是否有效
      if (!id) {
        return res.status(400).json({ message: '缺少必要的参数' });
      }

      // 使用 Knex 更新公司信息
      const result = await db('CompanyInfo')
        .where('ID', id)
        .update(fieldsToUpdate);

      if (result > 0) {
        res.status(200).json({success:true, message: '公司信息更新成功' });
      } else {
        res.status(404).json({ message: '未找到指定的公司信息' });
      }
    } catch (error) {
      console.error('更新公司信息失败:', error);
      res.status(500).json({ message: '服务器错误', error: error });
    }
  } 
  if (req.method === 'GET') {
    //获取当前用户的公司信息
    try {
      const companyInfo = await db('CompanyInfo')
        .where('userid', id)

      if (companyInfo) {
        res.status(200).json(companyInfo);
      } else {
        res.status(404).json({ message: '未找到指定的公司信息' });
      }
    } catch (error) {
      console.error('获取公司信息失败:', error);
    }
  }
  else {
    // 设置允许的方法
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: '方法不允许' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await db("auth_codes").where({ id }).del();
      res.status(200).json({ message: '认证码删除成功' });
    } catch (error) {
      res.status(500).json({ message: '删除认证码失败' });
    }
  }
}

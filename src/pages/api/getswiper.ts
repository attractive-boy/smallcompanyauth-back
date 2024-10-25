// pages/api/getswiper.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import db from '../../db'; // 假设你的数据库连接文件

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method, req.url);
  if (req.method === 'GET') { 
    try {
      
    const result = await db('system_settings').where('settingkey', '=','indexpagebanner').select('settingvalue');
    console.log('result:', result);
    // 前面拼接上静态域名
    const data = JSON.parse(result[0].settingvalue).map((item:any) => `${process.env.BASE_URL}/minio` + item)
      return res.status(200).json({data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    return res.status(405).json({ message: '方法不允许' });
  }
}

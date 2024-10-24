
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../db'; // 假设你的数据库连接文件

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received request:', req.method, req.url);
  if (req.method === 'POST') {
    const { key, value } = req.body;
    console.log('Received data:', key, value);
    if (!key || !value) {
      return res.status(400).json({ message: '键或值不能为空' });
    }
    try {
      // 在这里执行数据库更新操作，使用 key 和 value
      // 例如，使用 Knex.js 或其他数据库库
      // 如果value是数组
      if(Array.isArray(value)){
        const saveData = value.map(item => {
            return item.response?.relativePath;
        });
        console.log(saveData);
        await db('system_settings').where('settingkey', key).update({ settingvalue : JSON.stringify(saveData) });
      }else{
        await db('system_settings').where('settingkey', key).update({ settingvalue : value });
      }

      return res.status(200).json({ message: '设置成功' });
    } catch (error) {
      console.error('数据库更新失败:', error);
      return res.status(500).json({ message: '数据库更新失败' });
    }
  } else {
    return res.status(405).json({ message: '方法不允许' });
  }
}

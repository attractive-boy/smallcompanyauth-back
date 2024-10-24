// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import db from "../../db"; 

const JWT_SECRET = process.env.JWT_SECRET || '';
const APP_ID = process.env.WECHAT_APP_ID; // 微信小程序的 AppID
const APP_SECRET = process.env.WECHAT_APP_SECRET; // 微信小程序的 AppSecret

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { code, phone, authcode } = req.body;

    try {
      //查一下认证码是否存在
      const authcode_data = await db('auth_codes').where({ code : authcode  }).first();

      if (!authcode_data) {
        return res.status(401).json({ message: '认证码错误' });
      }

      // 使用 code 调用微信的 API 获取 openid 和 session_key
      const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
        params: {
          appid: APP_ID,
          secret: APP_SECRET,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      const { openid } = response.data;

      if (!openid) {
        return res.status(401).json({ message: '授权失败' });
      }

      let user = await db('users').where({ username: phone }).first();
      if (!user) {
        // 如果用户不存在，则创建一个新的用户
        await db('users').insert({ openid,username: phone, password_hash: authcode });
      }

      // 生成 JWT
      // const token = jwt.sign({ openid }, JWT_SECRET, { expiresIn: '1h' });
      user = await db('users').where({ username: phone }).first();
      // 返回 token
      return res.status(200).json({id: user.id})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

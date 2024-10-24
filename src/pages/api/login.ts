// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db"; 
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 在这里设置你的 JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || ''; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // 查询用户（这取决于你的数据库实现）
    const user = await db('users') // 替换为你的用户表名
        .where({ username })
        .first();

    if (!user) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 检查密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, username: user.username }, // 你可以根据需要自定义 payload
      JWT_SECRET,
      { expiresIn: '1h' } // 设置 token 有效期
    );

    // 返回 token
    return res.status(200).json({code:200, data:{ token } });
  } else {
    // 只允许 POST 请求
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}

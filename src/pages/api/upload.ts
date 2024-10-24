// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import * as Minio from 'minio'
import formidable, { File } from 'formidable';
import fs from 'fs';

// 配置 MinIO 客户端，使用环境变量
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || ''
});

// 禁用 Next.js 默认的 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
};

// 辅助函数：用于解析上传的文件
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files; }> => {
    const form = formidable();
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
  };

// 上传文件处理函数
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // 解析文件
      const { files } = await parseForm(req);
      console.log('文件信息:', files);
      const file:any = files.file;

      if (!file) {
        return res.status(400).json({ error: '没有上传文件' });
      }
      const fileStream = fs.createReadStream(file[0].filepath);
      const fileStat = fs.statSync(file[0].filepath);
      const bucketName = 'smallcompanyauth'; 
      const objectName = file[0].newFilename + '.' + file[0].originalFilename.split('.').pop();

      // 确认存储桶是否存在，不存在则创建
      const bucketExists = await minioClient.bucketExists(bucketName);
      console.log('Bucket exists:', bucketExists);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      // 上传文件到 MinIO
      await minioClient.putObject(bucketName, objectName, fileStream, fileStat.size);

      // 生成对象的相对路径
      const relativePath = `/${bucketName}/${objectName}`;

      // 响应成功，返回相对路径
      return res.status(200).json({ message: '文件上传成功！', relativePath });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '上传文件时出错' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `不允许的方法 ${req.method}` });
  }
}

import WxPay from 'wechatpay-node-v3';
import fs from 'fs';
import knex from '../../../../db'; // 假设你的数据库连接文件
import type { NextApiRequest, NextApiResponse } from 'next';
import { Irefunds2 } from 'wechatpay-node-v3/dist/lib/interface';

// 创建微信支付客户端
const pay = new WxPay({
    appid: process.env.WECHAT_APP_ID || '',
    mchid: process.env.WECHAT_MCH_ID || '',
    publicKey: fs.readFileSync('src/certificate/apiclient_cert.pem'), // 公钥
    privateKey: fs.readFileSync('src/certificate/apiclient_key.pem'), // 秘
  });

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    try {

      // 从数据库查询订单信息
      const orderInfo = await knex('CompanyInfo').where({id}).first();

      if (!orderInfo) {
        return res.status(404).json({ message: '未找到订单信息' });
      }

      // 提取相关信息
      const { PaymentOrderNumber } = orderInfo;

      // 创建退款请求
      const refundData = {
        out_trade_no: PaymentOrderNumber.toString() , // 商户系统内部的交易单号
      } as Irefunds2;

      // 调用微信支付接口发起退款
      const refundResponse = await pay.refunds(refundData);
      console.log('退款请求发送成功:', refundResponse);

      // 更新订单状态
      await knex('orders').where({id}).update({ IsPaid: 2 });

      // 返回成功响应
      return res.status(200).json({ code: 200, message: '退款请求已发送', data: refundResponse });
    } catch (error) {
      console.error('处理退款请求失败:', error);
      return res.status(500).json({ message: '处理退款请求失败', error });
    }
  } else {
    return res.status(405).json({ message: '方法不允许' });
  }
}
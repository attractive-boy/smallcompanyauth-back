// pages/api/company.js
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../db'; // 假设你的数据库连接文件

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      let {
        legalPersonName,
        companyName,
        certificationCode,
        phoneNumber,
        idCardNumber,
        revenue,
        serviceItems,
        paymentMethod,
        isPaid,
        paymentTime,
        serviceItemsAmount,
        discountAmount,
        registrationTime,
        unifiedSocialCreditCode,
        paymentOrderNumber,
        orderNumber,
        orderStatus,
        description,
      } = req.body;

      //根据userid 查询出 certificationCode phoneNumber 
      const user = await db('users').where('id', req.body.userid).first();
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      console.log(user)
      certificationCode = user.password_hash;
      phoneNumber = user.username;

      isPaid = 0;
      discountAmount = (Math.random() * (1 - 0.4) + 0.4).toFixed(2);
      const timestamp = Date.now(); // 获取当前时间戳，单位为毫秒
      const randomNum = Math.floor(Math.random() * 900000) + 100000; // 生成 6 位随机数
      orderNumber = `${timestamp}${randomNum}`; // 将时间戳和随机数拼接
      orderStatus = "未处理"
      // 使用 Knex 插入公司信息
      const [id] = await db('CompanyInfo').insert({
        LegalPersonName: legalPersonName,
        CompanyName: companyName,
        CertificationCode: certificationCode,
        PhoneNumber: phoneNumber,
        IDCardNumber: idCardNumber,
        Revenue: revenue,
        ServiceItems: serviceItems,
        PaymentMethod: paymentMethod,
        IsPaid: isPaid,
        PaymentTime: paymentTime,
        ServiceItemsAmount: serviceItemsAmount,
        DiscountAmount: discountAmount,
        RegistrationTime: registrationTime ?? new Date(),
        UnifiedSocialCreditCode: unifiedSocialCreditCode,
        PaymentOrderNumber: paymentOrderNumber,
        OrderNumber: orderNumber,
        OrderStatus: orderStatus,
        Description: description,
        userid: req.body.userid
      });

      res.status(201).json({ code:200, message: '公司信息保存成功', id });
    } catch (error) {
      console.error('保存公司信息失败:', error);
      res.status(500).json({ message: '服务器错误', error: error });
    }
  } else if (req.method === 'GET') {
    try {
      const queryParams : any = req.query;

      // 分页参数
      const current = parseInt(queryParams.current) || 1; // 当前页，默认第 1 页
      const pageSize = parseInt(queryParams.pageSize) || 10; // 每页数量，默认 10 条

      let query = db('CompanyInfo');

      // 遍历查询参数，动态生成查询条件
      Object.keys(queryParams).forEach((key) => {
        const value = queryParams[key];

        // 忽略分页参数和空值或 undefined 的参数
        if (value && key !== 'current' && key !== 'pageSize') {
          if (key === 'companyName') {
            query = query.where('CompanyName', 'like', `%${value}%`); // 模糊查询公司名称
          } else {
            query = query.where(key, value); // 其他字段精确匹配
          }
        }
      });

      // 获取分页数据
      const total:any = await query.clone().count('* as count').first(); // 查询总条数
      const companyInfo = await query
        .limit(pageSize)
        .offset((current - 1) * pageSize) // 计算 offset
        .select();

      // 返回分页结果
      res.status(200).json({
        code: 200,
        data: companyInfo,
        total: total.count, // 返回记录总数
        current,
        pageSize,
      });
    } catch (error) {
      console.error('查询公司信息失败:', error);
      res.status(500).json({ message: '服务器错误', error: error });
    }
  } else {
    // 仅支持 POST 和 GET 请求
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ message: '方法不允许' });
  }
}

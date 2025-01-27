// pages/api/getswiper.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import db from "../../../db"; // 假设你的数据库连接文件

const token = process.env.TYC_TOKEN;
const fetchCompanyInfo = async (keyword: string) => {
  const url = `http://open.api.tianyancha.com/services/open/ic/baseinfo/normal?keyword=${encodeURIComponent(
    keyword
  )}`;
  console.log("url:", url);

  const response = await axios.get(url, {
    headers: {
      Authorization: token,
    }
  });
  return response.data;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received request:", req.method, req.url);
  if (req.method === "GET") {
    try {
      const { id }: any = req.query;
      const result = await fetchCompanyInfo(id);
      //更新查询次数
      const _ = await db("statistics").increment("query_company_count", 1);
      return res.status(200).json({ result: result.result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "服务器错误" });
    }
  } else {
    return res.status(405).json({ message: "方法不允许" });
  }
}

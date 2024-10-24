import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // 处理 POST 请求，新增服务
    const { service_name, price, description } = req.body;
    console.log("请求数据:", service_name);

    if (!service_name || !price) {
      return res.status(400).json({ message: "服务名称和价格是必填项" });
    }

    try {
      // 插入新服务并返回所有服务数据
      await db("services").insert({
        service_name,
        price,
        description: description || null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 获取并返回所有服务
      const allServices = await db("services").select("*").orderBy("created_at", "desc");

      res.status(201).json(allServices); // 返回所有服务数据
    } catch (error) {
      console.error("新增服务失败:", error);
      res.status(500).json({ message: "服务器错误" });
    }
  } else if (req.method === "GET") {
    try {
      // 获取所有服务
      const services = await db("services").select("*").orderBy("created_at", "desc");
      res.status(200).json(services); // 返回所有服务数据
    } catch (error) {
      console.error("获取服务失败:", error);
      res.status(500).json({ message:"服务器错误" });
    }
  }  
  else {
    // 其他方法不支持
    res.setHeader("Allow", ["POST","GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

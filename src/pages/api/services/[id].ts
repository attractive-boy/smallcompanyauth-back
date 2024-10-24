import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    // 处理 DELETE 请求，删除指定 ID 的服务
    try {
      const deletedService = await db("services").where({ id }).del();

      if (deletedService) {
        res.status(200).json({ message: "服务删除成功" });
      } else {
        res.status(404).json({ message: "未找到指定的服务" });
      }
    } catch (error) {
      console.error("删除服务失败:", error);
      res.status(500).json({ message: "服务器错误" });
    }
  } else if (req.method === "PUT") {
    // 处理 PUT 请求，更新服务
    const { service_name, price, description } = req.body;

    if (!service_name || !price) {
      return res.status(400).json({ message: "服务名称和价格是必填项" });
    }

    try {
      const updatedService = await db("services")
        .where({ id })
        .update({
          service_name,
          price,
          description: description || null,
          updated_at: new Date(),
        })
        .returning("*"); // 返回更新的服务数据

        // 返回更新后的服务
        const allServices = await db("services")
          .select("*")
          .orderBy("created_at", "desc");
        res.status(200).json(allServices); // 返回所有服务数据
    
    } catch (error) {
      console.error("更新服务失败:", error);
      res.status(500).json({ message: "服务器错误" });
    }
  } else {
    // 其他方法不支持
    res.setHeader("Allow", ["DELETE", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { code } = req.body;

    try {
      // Insert the new verification code into the database
      const [newCode] = await db("auth_codes").insert({ code }).returning("*");

      // Fetch all verification codes after the insert
      const updatedVerificationCodes = await db("auth_codes").select("*").where("id", "=", newCode)

      // Return the updated list of codes
      return res.status(200).json(updatedVerificationCodes);
    } catch (error) {
      console.error("Error adding verification code:", error);
      return res.status(500).json({ message: "服务器错误，请稍后再试。" });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ message: "不支持的请求方法" });
  }
}

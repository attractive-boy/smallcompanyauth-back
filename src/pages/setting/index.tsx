// pages/pro-form-example.js
import React, { useState } from "react";
import {
  ProForm,
  ProFormUploadButton,
  ProFormText,
} from "@ant-design/pro-components";
import "antd/dist/reset.css";
import Layout from "@/components/Layout";
import db from "../../db";
import request from "../../request";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// 动态导入 ReactQuill，避免 SSR 问题
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ProFormExample = ({ initialValues }: any) => {
  console.log("Initial values:", initialValues);
  const [form] = ProForm.useForm(); // 使用 ProForm 的表单实例
  const [receiptContent, setReceiptContent] = useState(
    initialValues?.receiptContent || ""
  ); // 初始化 receiptContent
  const [userAgreement, setUserAgreement] = useState(
    initialValues?.userAgreement || ""
  );
  const [privacyPolicy, setPrivacyPolicy] = useState(
    initialValues?.privacyPolicy || ""
  );

  const userAgreementChange = (content: string) => {
    setUserAgreement(content);
    form.setFieldsValue({ userAgreement });
  };

  const privacyPolicyChange = (content: string) => {
    setPrivacyPolicy(content);
    form.setFieldsValue({ privacyPolicy });
  };

  const receiptContentChange = (content: string) => {
    setReceiptContent(content);
    form.setFieldsValue({ receiptContent });
  };
  const handleValuesChange = async (changedValues: any, allValues: any) => {
    try {
      console.log("Values changed:", changedValues);
      console.log("Auto-submitting form with values:", allValues);
      const validateResult = await form.validateFields(); // 验证字段是否有效
      console.log("Form is valid, submitting:", allValues);

      // 遍历 changedValues
      for (const key in changedValues) {
        const value = changedValues[key];
        // 在这里处理每个字段的值
        const response = await request("/api/changesetting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, value }),
        });
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Layout>
      <ProForm
        form={form} // 绑定表单实例
        onValuesChange={handleValuesChange} // 监听值的变化
        layout="vertical" // 垂直布局
        submitter={false} // 关闭提交按钮
        initialValues={initialValues} // 设置初始值
        style={{ overflowY: "auto", height: "100%" }}
      >
        <ProFormUploadButton
          name="indexpagebanner"
          label="首页轮播图"
          fieldProps={{
            name: "file",
            listType: "picture-card",
          }}
          action="/api/upload"
        />
        <ProFormUploadButton
          name="newnoticeicon"
          label="最新公告图标"
          max={1}
          fieldProps={{
            name: "file",
            listType: "picture-card",
          }}
          action="/api/upload"
        />
        <ProFormUploadButton
          name="companyicon"
          label="企业认证图标"
          max={1}
          fieldProps={{
            name: "file",
            listType: "picture-card",
          }}
          action="/api/upload"
        />

        <ProFormUploadButton
          name="companynumicon"
          label="认证企业数量图标"
          max={2}
          fieldProps={{
            name: "file",
            listType: "picture-card",
          }}
          action="/api/upload"
        />
        <ProFormText width="md" name="bah" label="备案号" />
        <ProFormText width="md" name="kftelphone" label="客服电话" />
        <ProFormText width="md" name="kfwechat" label="客服微信" />
        <ProFormUploadButton
          name="authenticatelog"
          label="企业认证流程图"
          max={1}
          fieldProps={{
            name: "file",
            listType: "picture-card",
          }}
          action="/api/upload"
        />
        <ProFormUploadButton
          name="customericon"
          label="客服图标"
          max={1}
          fieldProps={{
            name: "file",
            listType: "picture-card",
          }}
          action="/api/upload"
        />
        <ProForm.Item name="receiptContent" label="回执单内容">
          <ReactQuill value={receiptContent} onChange={receiptContentChange} />
        </ProForm.Item>
        {/* 用户协议 */}
        <ProForm.Item name="userAgreement" label="用户协议">
          <ReactQuill
            value={userAgreement}
            onChange={userAgreementChange}
          />
        </ProForm.Item>

        {/* 隐私协议 */}
        <ProForm.Item name="privacyPolicy" label="隐私协议">
          <ReactQuill
            value={privacyPolicy}
            onChange={privacyPolicyChange}
          />
        </ProForm.Item>
      </ProForm>
    </Layout>
  );
};

// Fetch initial values from the database
export async function getServerSideProps() {
  try {
    const settings = await db("system_settings").select(
      "settingkey",
      "settingvalue"
    );
    const { MINIO_ENDPOINT, MINIO_PORT } = process.env;
    const initialValues = settings.reduce(
      (
        acc: any,
        {
          settingkey,
          settingvalue,
        }: { settingkey: string; settingvalue: string | null }
      ) => {
        // Parse settingvalue if it's not null and check for the expected structure
        if (settingvalue) {
          try {
            const parsedValue = JSON.parse(settingvalue);
            // Check if parsedValue is an array
            if (Array.isArray(parsedValue)) {
              // Map parsed values to the required structure for upload buttons
              acc[settingkey] = parsedValue.map((url, index) => ({
                uid: (index + 1).toString(), // Generate a unique ID for each file
                name: url.split("/").pop(), // Extract the file name from the URL
                status: "done", // Indicate that the upload is complete
                url: `${process.env.BASE_URL}/minio` + url,
              }));
            } else {
              acc[settingkey] = settingvalue; // If not an array, set to empty array
            }
          } catch (error) {
            console.error(
              `Failed to parse settingvalue for key ${settingkey}:`,
              error
            );
            acc[settingkey] = settingvalue; // In case of parsing error, set to empty array
          }
        } else {
          acc[settingkey] = settingvalue; // Default to empty array if settingvalue is null
        }
        return acc;
      },
      {}
    );
    console.log("initialValues==>", initialValues);
    return {
      props: {
        initialValues: initialValues || {},
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {};
  }
}

export default ProFormExample;

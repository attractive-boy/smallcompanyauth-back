import { Card, Col, Row, Statistic } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import Layout from "@/components/Layout"; // 确保路径正确
import db from "../../db"; // 引入数据库连接
import { GetServerSideProps } from "next";

type StatisticsPageProps = {
  queryCompanyCount: number;
  realNameCount: number;
};

const StatisticsPage = ({ queryCompanyCount, realNameCount }: StatisticsPageProps) => {
  return (
    <Layout>
      <div style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
        <Row gutter={16}>
          {/* 查询企业次数 */}
          <Col span={12}>
            <Card>
              <Statistic
                title="查询企业次数"
                value={queryCompanyCount}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="次"
              />
            </Card>
          </Col>
          {/* 实名输入次数 */}
          <Col span={12}>
            <Card>
              <Statistic
                title="实名输入次数"
                value={realNameCount}
                valueStyle={{ color: "#cf1322" }}
                prefix={<ArrowUpOutlined />}
                suffix="次"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

// 服务端渲染函数，直接连接数据库查询数据
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // 从数据库中查询数据
    const statistics = await db('statistics')
      .select('query_company_count', 'real_name_input_count')
      .first(); // 获取第一个结果

    return {
      props: {
        queryCompanyCount: statistics?.query_company_count || 0, // 如果数据为空则设置为 0
        realNameCount: statistics?.real_name_input_count || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      props: {
        queryCompanyCount: 0,
        realNameCount: 0,
      },
    };
  }
};

export default StatisticsPage;

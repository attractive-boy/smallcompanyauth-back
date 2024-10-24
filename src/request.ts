// request.ts
import { extend } from 'umi-request';

// 创建请求实例
const request = extend({
  prefix: '',
});

// 请求拦截器
request.interceptors.request.use((url, options) => {
  // 从 localStorage 或其他地方获取 token
  const token = localStorage.getItem('token'); // 你可以根据实际情况调整获取方式

  // 如果 token 存在，添加到请求头
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`, // 添加 token
    };
  }

  return { url, options };
});

// 响应拦截器（可选）
request.interceptors.response.use((response) => {
  // 可以在这里处理响应数据，比如全局错误处理
  return response;
});

// 导出配置好的请求实例
export default request;

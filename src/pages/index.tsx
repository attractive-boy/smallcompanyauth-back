// pages/index.tsx
'use client';
import React, { useState } from 'react';
import styles from '../styles/login.module.css'; // 导入 CSS Modules
import request from 'umi-request';

const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 在这里处理登录逻辑
    console.log('Username:', username);
    console.log('Password:', password);
    // /api/login 
    request.post('/api/login', {
      data: {
        username: username,
        password: password
      }
    }).then(res => {
      console.log(res);
      if (res.code === 200) {
        localStorage.setItem('token', res.data.token);
        // 登录成功，跳转到首页
        window.location.href = '/home';
      } else {
        // 登录失败，显示错误信息
        alert(res.message);
      }
    })
  };

  return (
    <div className={styles.loginContainer}> {/* 使用 CSS Module 中的类名 */}
      <h2 style={{textAlign: 'center',color : 'black'}}>小微企业认证小程序管理平台</h2>
      <form onSubmit={handleLogin}>
        <div className={styles.inputGroup}> {/* 使用 CSS Module 中的类名 */}
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}> {/* 使用 CSS Module 中的类名 */}
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.loginButton}>登录</button> {/* 使用 CSS Module 中的类名 */}
      </form>
    </div>
  );
};

export default HomePage;

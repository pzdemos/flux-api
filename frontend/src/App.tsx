import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Projects } from './pages/Projects';
import Workspace from './pages/Workspace'; // Make sure this is correct

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Card: {
             // more flat
             colorBorderSecondary: 'transparent'
          },
          Layout: {
             headerBg: darkMode ? '#141414' : '#ffffff',
             bodyBg: darkMode ? '#000000' : '#f5f5f5',
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Projects />} />
          <Route path="/workspace/:id" element={<Workspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

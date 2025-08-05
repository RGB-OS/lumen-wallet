import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { ConnectNode } from '@/components/wallet/ConnetNode';
import { RequireAuth } from '@/components/common/RequireAuth';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { AssetPage } from '@/components/asset/AssetPage';
import SendAssetPage from '@/components/asset/SendPage';
import ReceiveAssetPage from '@/components/asset/ReciveAssetPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ConnectNode />} />
          <Route path="/wallet" element={<RequireAuth><WalletLayout /></RequireAuth>} >
            <Route index element={<WalletDashboard />} />
            <Route path="send/:asset_id" element={<SendAssetPage />} />
            <Route path="asset/:asset_id" element={<AssetPage />} />
            <Route path="receive/:asset_id" element={<ReceiveAssetPage/>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
      {/* <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p> */}
    </>
  );
}

export default App;

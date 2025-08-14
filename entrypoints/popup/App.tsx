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
  useEffect(() => {
   async () => {
      await storage.setItem('local:node-endpoint', 'https://cognito-node-api.thunderstack.org/nodes/c17bc5d0-80b1-7050-5af5-dfd8a67834f1/ee3da079881843a99cc082a3a73b6fa4');
      await storage.setItem('local:access-token', 'eyJraWQiOiIwYnJDOXYyVUNUZkZNNVE0M3poT0pISXRLNE1WRGxaWlVvU1JremRRQm44PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMTdiYzVkMC04MGIxLTcwNTAtNWFmNS1kZmQ4YTY3ODM0ZjEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfdjFRVEtDc2VFIiwiY29nbml0bzp1c2VybmFtZSI6ImJhbmRyaXZza2l5Iiwib3JpZ2luX2p0aSI6ImI5MWFhMDkxLTg0NDYtNGE3Ni1hM2FjLTZiNjNkZTBmMjZlNSIsImF1ZCI6IjUwbG1vbjhldGFobTUwMnY5YnM3aWhuaWZmIiwiZXZlbnRfaWQiOiJjNjkxMmEzMC02YjNmLTRiZTItYTVkMi1hODE4YTU4MzAzMDQiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc1NTA5ODE4NiwiZXhwIjoxNzU1MTE5Nzg2LCJpYXQiOjE3NTUwOTgxODYsImp0aSI6ImU5Y2Y2NzZmLTU3ZjctNDcxMC1iYmIyLTkxZDE3Mjc1MmEwYSIsImVtYWlsIjoiYmFuZHJpdnNraXk5NkBnbWFpbC5jb20ifQ.sO0Iu0ZeK1JNzduf6YDxwHKqHkCkN2lO1zSvP84-TrUWGgcF-7TGFg6IEK9nOnSFsFE696a_Xf8Ot-G4oRJR86dlpkPzZTNBAjE4BFgESONyOFqzbjfTc1c8m3ZICHxyutdB_LuZNb7SeGfQzrk32QrrttN1r8sYPYqsFMt_ej4ElwfjskibxILn08oOv6nB7UGWihZk9s-kpJYgvsEjmyBynWfIUCN34kRlk5NY3syVcBEAb4lYyRCoowAjCUzxSoH0h8DV-LsZquPjD2-M1Ec_CB8c2rpml1lZEG_uhcmuuM1UJC93SuXpWPn5s6_UnjQI_-XSxoJtbO0ByEsu_Q');
    };
    console.log('App component mounted');

  }, []);

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ConnectNode />} />
          <Route path="/wallet" element={<RequireAuth><WalletLayout /></RequireAuth>} >
            <Route index element={<WalletDashboard />} />
            <Route path="send/:asset_id" element={<SendAssetPage />} />
            <Route path="asset/:asset_id" element={<AssetPage />} />
            <Route path="receive/:asset_id" element={<ReceiveAssetPage />} />
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

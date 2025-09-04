import { useState, useEffect } from 'react';
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
import { UTXOsPageRefactored as UTXOsPage } from '@/components/wallet/UTXOsPageRefactored';
import ReceiveBTCPage from '@/components/wallet/ReceiveBTCPage';
import SendRecipient from '@/components/wallet/SendRecipient';
import SendBTCPage from '@/components/wallet/SendBTCPage';
import Approval from '@/components/approval';
import TransactionConfirmation from '@/components/asset/TransactionConfirmation';
import MessageSigningConfirmation from '@/components/asset/MessageSigningConfirmation';
import InvoiceGenerationConfirmation from '@/components/asset/InvoiceGenerationConfirmation';
import { QueryProvider } from '@/providers/queryProvider';
import { ConfirmProvider } from '@/providers/confirmProvider';
import { ToastProvider } from '@/providers/toastProvider';
import { AutoRefreshProvider } from '@/providers/autoRefreshProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { openLoginTabAndClosePopup } from '@/utils';
import { authService } from '@/services/authService';

function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Initialize defaults when popup opens (if missing), then check auth
    (async () => {
      try {
        await authService.initializeDefaults();
      } catch {}
      
      // If popup opens on any route and user is unauthenticated, open full-page login
      try {
        const isLoginRoute = location.hash === '#/login' || location.hash === '#login';
        if (isLoginRoute) {
          return; // already on login, don't open a new tab
        }
        const authenticated = await authService.isAuthenticated();
        if (!authenticated) {
          openLoginTabAndClosePopup();
        }
      } catch {
        openLoginTabAndClosePopup();
      }
    })();
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ConfirmProvider>
          <ToastProvider>
            <AutoRefreshProvider>
              <HashRouter>
                <Routes>
                  <Route path="/login" element={<ConnectNode />} />
                  <Route path="/approval" element={<Approval />} />
                  <Route path="/confirm-transaction" element={<TransactionConfirmation />} />
                  <Route path="/confirm-message-signing" element={<MessageSigningConfirmation />} />
                  <Route path="/confirm-invoice-generation" element={<InvoiceGenerationConfirmation />} />
                  <Route path="/" element={<ConnectNode />} />
                  <Route path="/wallet" element={<RequireAuth><WalletLayout /></RequireAuth>} >
                    <Route index element={<WalletDashboard />} />
                    <Route path="recipient" element={<SendRecipient />} /> {/* New route for recipient input */}
                    <Route path="send" element={<SendAssetPage />} /> {/* Generic send page for RGB */}
                    <Route path="send/:asset_id" element={<SendAssetPage />} /> {/* Specific asset send page */}
                    <Route path="send-btc" element={<SendBTCPage />} /> {/* New route for BTC send */}
                    <Route path="asset/:asset_id" element={<AssetPage />} />
                    <Route path="receive/:asset_id" element={<ReceiveAssetPage />} />
                    <Route path="receive" element={<ReceiveAssetPage />} />
                    <Route path="receive-btc" element={<ReceiveBTCPage />} /> {/* New route for BTC receive */}
                    <Route path="utxos" element={<UTXOsPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </HashRouter>
            </AutoRefreshProvider>
          </ToastProvider>
        </ConfirmProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;

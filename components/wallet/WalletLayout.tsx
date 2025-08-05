import { RLNApiProvider } from "@/providers/nodeProvider";
import { PropsWithChildren } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export const WalletLayout: React.FC<PropsWithChildren> = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()
  
    const showBack = location.pathname !== '/wallet'
  
    return (
        <RLNApiProvider>
               {showBack && (
        <button onClick={() => navigate(-1)} className="mb-4 text-sm">
          ← Back
        </button>
      )}
            <Outlet />

        </RLNApiProvider>
    );
}
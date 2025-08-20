import { RLNApiProvider } from "@/providers/nodeProvider";
import { PropsWithChildren } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const TITLE_MAP: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/wallet$/, title: 'Wallet Overview' },
  { pattern: /^\/wallet\/send$/, title: 'Send Asset' },
  { pattern: /^\/wallet\/send\/[^/]+$/, title: 'Send Asset' },
  { pattern: /^\/wallet\/asset\/[^/]+$/, title: 'Asset Details' },
  { pattern: /^\/wallet\/receive$/, title: 'Receive Asset' },
  { pattern: /^\/wallet\/receive\/[^/]+$/, title: 'Receive Asset' },
];

function getTitleFromPath(pathname: string): string {
  const match = TITLE_MAP.find(({ pattern }) => pattern.test(pathname));
  return match?.title ?? 'Wallet';
}

export const WalletLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const title = getTitleFromPath(location.pathname);
  const showBack = location.pathname !== '/wallet'

  return (
    <RLNApiProvider>
      <div className="h-screen w-full flex flex-col bg-background ">
     
      {showBack && ( <div className="flex justify-between px-6 py-4 items-center">
    
          <Button variant="outline" onClick={() => navigate(-1)} className="size-12  bg-white rounded-2xl">
           <Icons.chevronLeft className="size-8 text-foreground"/>
          </Button>

       
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    <Icons.ellipsis className="size-6 text-gray-dark" />
      </div>
    )}
    <div className="flex-1 relative">
      <Outlet />
      </div>
      </div>
    </RLNApiProvider>
  );
}
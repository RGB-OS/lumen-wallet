import React from 'react';
import { Icons } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSync } from '@/hooks/useSync';
import { useLogout } from '@/hooks/useLogout';
import { useToast } from '@/hooks/useToast';
import packageJson from '../../package.json';

interface AppDropdownMenuProps {
  trigger: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const AppDropdownMenu: React.FC<AppDropdownMenuProps> = ({ 
  trigger, 
  align = 'end',
  className = 'w-48'
}) => {
  const { sync, isSyncing } = useSync();
  const { logout } = useLogout();
  const { success, error } = useToast();

  const handleRefresh = async () => {
    try {
      await sync();
      success('Sync completed successfully');
    } catch (err) {
      console.error('Failed to sync:', err);
      error('Failed to sync. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
  };

  const handleFullscreen = () => {
    // Open extension in new tab for fullscreen experience
    const extensionUrl = browser.runtime.getURL('/popup.html#/wallet');
    browser.tabs.create({ url: extensionUrl });
  };

  const handleContactSupport = () => {
    // Open ThunderStack support Telegram link
    window.open('https://t.me/thunder_stack', '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        <DropdownMenuItem onClick={handleFullscreen} className="cursor-pointer">
          <Icons.maximize className="mr-2 h-4 w-4" />
          <span>Fullscreen</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleContactSupport} className="cursor-pointer">
          <Icons.messageCircle className="mr-2 h-4 w-4" />
          <span>Contact Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <Icons.logOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-default text-muted-foreground">
          <span className="text-xs">Lumen v{packageJson.version}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

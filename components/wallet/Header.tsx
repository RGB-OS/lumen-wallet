import { Icons } from '../icons';
import { useSync } from '@/hooks/useSync';
import { useLogout } from '@/hooks/useLogout';
import { useToast } from '@/hooks/useToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import lumenIcon from '@/assets/logo.png';
import packageJson from '../../package.json';
export const Header: React.FC = () => {
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

    return <header className="bg-card border-b border-border">
        <div className=" px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {/* <div className="h-8 w-8 bg-gradient-to-r from-bitcoin to-accent rounded-full flex items-center justify-center"> */}
                {/* <Wallet className="h-5 w-5 text-bitcoin-foreground" /> */}
                {/* <Icons.thunderGradient className="text-white h-10 w-10" /> */}
                {/* </div> */}
                <img src={lumenIcon} alt="Lumen" className=" h-10 w-10" />
                <div className="text-lg font-bold">Lumen</div>

            </div>
            <div className="flex items-center space-x-4">
                <Icons.refresh 
                    className={`h-5 w-5 text-muted-foreground cursor-pointer transition-opacity ${
                        isSyncing ? 'opacity-40 animate-spin' : 'opacity-60 hover:opacity-100'
                    }`}
                    onClick={handleRefresh}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Icons.menu className="h-5 w-5 text-muted-foreground cursor-pointer opacity-60 hover:opacity-100" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
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
            </div>
        </div>
    </header>
}
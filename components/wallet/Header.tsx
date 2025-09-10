import { Icons } from '../icons';
import { useSync } from '@/hooks/useSync';
import { useToast } from '@/hooks/useToast';
import { AppDropdownMenu } from '../common/AppDropdownMenu';
import lumenIcon from '@/assets/logo.png';
export const Header: React.FC = () => {
    const { sync, isSyncing } = useSync();
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
                <AppDropdownMenu
                    trigger={<Icons.menu className="h-5 w-5 text-muted-foreground cursor-pointer opacity-60 hover:opacity-100" />}
                />
            </div>
        </div>
    </header>
}
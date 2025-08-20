export const Header: React.FC = () => {
    return <header className="bg-card border-b border-border">
        <div className=" px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {/* <div className="h-8 w-8 bg-gradient-to-r from-bitcoin to-accent rounded-full flex items-center justify-center"> */}
                {/* <Wallet className="h-5 w-5 text-bitcoin-foreground" /> */}
                <Icons.thunderGradient className="text-white h-10 w-10" />
                {/* </div> */}
                <div className="text-lg font-bold">Lumen</div>
            </div>
            <div className="flex items-center space-x-4">
                <Icons.refresh className="h-5 w-5 text-muted-foreground cursor-pointer opacity-60" />
                <Icons.menu className="h-5 w-5 text-muted-foreground cursor-pointer opacity-60" />
            </div>
        </div>
    </header>
}
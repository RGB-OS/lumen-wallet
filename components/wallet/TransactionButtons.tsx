
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Icons } from "@/components/icons";
import { twMerge } from "tailwind-merge";
import { TransactionsDisplay } from "./TransactionsDisplay";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export const TransactionButtons = () => {
    const navigate = useNavigate();
    return <>
        <div className="flex flex-col items-center space-y-2">
            <Drawer>
                <DrawerTrigger asChild>
                    <Button className="size-16 text-foreground bg-white rounded-2xl" variant="outline" >
                        <Icons.recive className="size-8" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    {/* <DrawerHeader>
                        <DrawerTitle className="text-center text-mg">Select receive option</DrawerTitle>
                    </DrawerHeader> */}
                    <div className="p-4 grid gap-3 pb-12">
                        <Button  className="w-full text-lg h-12 bg-white font-semibold" variant="outline" onClick={() => navigate('/wallet/receive')}>
                            Receive RGB Asset
                        </Button>
                        <Button  className="w-full text-lg h-12 bg-white font-semibold" variant="outline" onClick={() => navigate('/wallet/receive-btc')}>
                            Receive Bitcoin on-chain
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
            <span>Recive</span>
        </div>

        <div className="flex flex-col items-center space-y-2">
            <Link to="/wallet/recipient">
                <Button className="size-16 text-foreground bg-white rounded-2xl" variant="outline" >
                    <Icons.send className="size-8" />
                </Button>
            </Link>
            <span>Send</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
            <Link to="/wallet/utxos">
                <Button className="size-16 bg-white rounded-2xl" variant="outline" >
                    <Icons.layers className="size-8" />
                </Button>
            </Link>
            <span>UTXOs</span>
        </div></>
}

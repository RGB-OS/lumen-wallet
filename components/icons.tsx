import { Settings,ArrowDownLeft,Wallet,CircleAlert,X,Check,ArrowUpRight,Plus,ChevronLeft,EllipsisVertical,SendHorizontal,Layers, LogOut,Copy, Menu ,RefreshCw,Download,Maximize,MessageCircle} from "lucide-react"

type IconProps = React.HTMLAttributes<SVGElement>
export const Icons = {
    settings: Settings,
    logOut: LogOut, 
    copy:Copy,
    menu: Menu,
    refresh:RefreshCw,
    recive: Download,
    send: SendHorizontal,
    layers:Layers,
    chevronLeft: ChevronLeft,
    ellipsis: EllipsisVertical,
    plus: Plus,
    arrowDownLeft: ArrowDownLeft,
    arrowUpRight: ArrowUpRight,
    check: Check,
    x: X,
    wallet: Wallet,
    circleAlert: CircleAlert,
    maximize: Maximize,
    messageCircle: MessageCircle,
    
    thunderGradient: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48" fill="none" {...props}>
        <path d="M26.5011 4.40584L22.1632 18.5329L21.6859 20.087L23.3117 20.0851L35.1572 20.0714L12.2985 43.5942L16.6364 29.4671L17.1137 27.913L15.4879 27.9149L3.6424 27.9286L26.5011 4.40584Z" stroke="url(#paint0_linear_286_1159)" strokeWidth="2.4" />
        <defs>
          <linearGradient id="paint0_linear_286_1159" x1="18.1998" y1="19.2" x2="22.3516" y2="39.0101" gradientUnits="userSpaceOnUse">
            <stop offset="0.080836" stopColor="#33C75C" />
            <stop offset="0.411764" stopColor="#FF9F00" />
            <stop offset="1" stopColor="#F83048" />
          </linearGradient>
        </defs>
      </svg>),
}
export const TxSkeleton = () => {
    return <div className="space-y-1 px-1">
        {[1, 2].map((i) => (
            <div key={i} className="bg-card flex items-center space-x-4 p-4 border border-border rounded-lg animate-pulse">
                <div className="h-10 w-10 animate-pulse bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 animate-pulse bg-gray-300 rounded w-24"></div>
                    <div className="h-3 animate-pulse bg-gray-300 rounded w-32"></div>
                </div>
                <div className="text-right space-y-2">
                    <div className="h-4 animate-pulse bg-gray-300 rounded w-20"></div>
                    <div className="h-3 animate-pulse bg-gray-300 rounded w-16"></div>
                </div>
            </div>
        ))}
    </div>
}
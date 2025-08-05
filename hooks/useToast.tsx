export const useToast = () => {
    const toast = (options: {
        title: string;
        description?: string;
        variant?: "default" | "destructive";
    }) => {
        // TODO: Implement toast functionality for extension
        console.log("Toast:", options);
    };
    
    return { toast };
}
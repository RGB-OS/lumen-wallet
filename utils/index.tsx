export const satoshisToBTC = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

export const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

let loginOpenInProgress = false;

export function openLoginTabAndClosePopup(): void {
    // Prevent duplicate openings within the same popup lifecycle or session
    if (loginOpenInProgress) return;
    try {
        if (sessionStorage.getItem('login-opened') === '1') {
            return;
        }
    } catch {
        // ignore
    }
    loginOpenInProgress = true;
    try {
        sessionStorage.setItem('login-opened', '1');
    } catch {
        // ignore
    }
    try {
        const loginHash = '#login';
        const anyWindow = window as unknown as { chrome?: any } & Window;
        const runtime = anyWindow.chrome?.runtime;
        const tabs = anyWindow.chrome?.tabs;
        // Add a parameter to prevent recursive calls
        const extensionUrl = runtime?.getURL ? runtime.getURL(`popup.html${loginHash}?from=tab`) : undefined;

        if (tabs && extensionUrl) {
            tabs.create({ url: extensionUrl });
        } else {
            // const targetUrl = extensionUrl || `${location.origin}/popup.html${loginHash}?from=tab`;
            // window.open(targetUrl, '_blank');
        }
    } catch (e) {
        // Fallback: try to navigate current window
        try {
            window.location.href = '#login';
        } catch {
            // ignore
        }
    } finally {
        try {
            window.close();
        } catch {
            // ignore
        }
    }
}
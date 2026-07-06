import { storage } from '#imports';

class AuthService {
    
    async getToken(): Promise<string | null> {
        const token = await storage.getItem<string>('local:access-token');
        if (token) {
        // const [, payloadBase64] = token.split('.');
        // const payloadJson = atob(payloadBase64);
        // const payload = JSON.parse(payloadJson);
        // const now = Date.now() / 1000; // in seconds
        // if (payload.exp && payload.exp < now) {
        //     console.warn('Token expired');
        //     await storage.removeItem('local:access-token');
        //     return null;
        // }
        return token;
        }
        return null;
    }
    
    async isAuthenticated(): Promise<boolean> {
        // A token is optional: nodes started without auth accept requests
        // without an Authorization header
        const nodeEndpoint = await storage.getItem<string>('local:node-endpoint');
        if (!nodeEndpoint) {
            console.warn('Node endpoint not set');
            return false;
        }
        return true;
    }
    

}

export const authService = new AuthService();
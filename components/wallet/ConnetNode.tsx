import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { storage } from '#imports';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";

const connectNodeSchema = z.object({
  nodeEndpoint: z.string().min(1, "Node endpoint is required"),
  accessToken: z.string().min(1, "Access token is required"),
});

type ConnectNodeForm = z.infer<typeof connectNodeSchema>;

interface ConnectNodeProps {
  // onConnected: () => void;
}

export const ConnectNode = () => {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate()
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //   const { toast } = useToast();
  console.log('ConnectNode component rendered');
  const { isAuthenticated, isLoading: authorizing } = useAuth()
  const externalInvoke = new URLSearchParams(location.search).get('from') === 'external';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectNodeForm>({
    resolver: zodResolver(connectNodeSchema),
  });

  useEffect(() => {
    if (!authorizing && isAuthenticated) {
      navigate('/wallet')
    }
  }, [isAuthenticated, authorizing])

  if (authorizing) return <div>Loading...</div>

  const onSubmit = async (data: ConnectNodeForm) => {
    setIsLoading(true);
    console.log('ConnectNode component rendered');

    try {
      const response = await axios.get(`${data.nodeEndpoint}/nodeinfo`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.accessToken}`,
        },
      })
      console.log('Response: sss', response);


      // Store connection details for future use
      await storage.setItem('local:node-endpoint', data.nodeEndpoint);
      await storage.setItem('local:access-token', data.accessToken);

      if (externalInvoke) {
        console.log('This popup was opened by script, so close it');
        browser.runtime.sendMessage({
          type: 'wallet-auth-response',
          success: true,
        });
        window.close();
      } else {
        console.log('This popup was opened by within EXTENSION');
        navigate('/wallet')
      }

    } catch (error) {
      browser.runtime.sendMessage({
        type: 'wallet-auth-response',
        success: false,
        error: 'Login failed',
      });
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.statusText || 'Unknown error'
        : 'Failed to connect to node';

      setErrorMessage(`Error: ${message}`);
      console.error('Error connecting to node:', error);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-card">
     
      <Card className="w-full max-w-md border-none shadow-none">
      <div className="-mt-24 bg-opacity-40 z-10 inset-0 h-full w-full " >
                <div className="flex items-center space-x-3 justify-self-center mt-8">
                    {/* <span className="pl-2 font-fixel  text-2xl font-semibold font-fixel leading-loose pt-2">Lumen</span> */}
                    <Icons.thunderGradient className="text-white h-24 w-24" />
                </div>
            </div>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connect Node</CardTitle>
          <CardDescription>
            Connect to your RGB LN to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nodeEndpoint">Node Endpoint</Label>
              <Input
                id="nodeEndpoint"
                type="url"
                className="rounded-lg"
                placeholder="https://your-node-endpoint.com"
                {...register("nodeEndpoint")}
                disabled={isLoading}
              />
              {errors.nodeEndpoint && (
                <p className="text-sm text-destructive   ">{errors.nodeEndpoint.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your access token"
                {...register("accessToken")}
                disabled={isLoading}
              />
              {errors.accessToken && (
                <p className="text-sm text-destructive">{errors.accessToken.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-semibold h-12" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </form>
          {errorMessage && (
            <div className="text-sm text-destructive pt-2 mb-4">{errorMessage}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
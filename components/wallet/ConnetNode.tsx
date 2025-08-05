import { useState,useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
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
//   const { toast } = useToast();
  console.log('ConnectNode component rendered');
  const { isAuthenticated, isLoading:authorizing } = useAuth()

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
  
      
    //   toast({
    //     title: "Success",
    //     description: "Successfully connected to node",
    //   });
    console.log('Successfully connected to node:', data.nodeEndpoint);
    navigate('/wallet')
 
      // onConnected();
    } catch (error) {
      console.error('Error connecting to node:', error);
    //   toast({
    //     title: "Connection Failed",
    //     description: error instanceof Error ? error.message : "Failed to connect to node",
    //     variant: "destructive",
    //   });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-card">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connect Node</CardTitle>
          <CardDescription>
            Connect to your Bitcoin node to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nodeEndpoint">Node Endpoint</Label>
              <Input
                id="nodeEndpoint"
                type="url"
                className=""
                placeholder="https://your-node-endpoint.com"
                {...register("nodeEndpoint")}
                disabled={isLoading}
              />
              {errors.nodeEndpoint && (
                <p className="text-sm text-destructive">{errors.nodeEndpoint.message}</p>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
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
        </CardContent>
      </Card>
    </div>
  );
};
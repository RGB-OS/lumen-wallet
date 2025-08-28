import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { nodeService } from '@/services/nodeService';

export const ErrorTest: React.FC = () => {
  const test504Error = async () => {
    try {
      // This will likely timeout and cause a 504 error
      await nodeService.listunspents({ skip_sync: false });
    } catch (error) {
      console.log('Error caught in component:', error);
    }
  };

  const testNetworkError = async () => {
    try {
      // This will cause a network error
      await nodeService.nodeinfo();
    } catch (error) {
      console.log('Network error caught in component:', error);
    }
  };

  const testInvalidEndpoint = async () => {
    try {
      // This will cause a 404 or connection error
      const originalEndpoint = localStorage.getItem('node-endpoint');
      localStorage.setItem('node-endpoint', 'https://invalid-endpoint.com');
      
      await nodeService.nodeinfo();
      
      // Restore original endpoint
      if (originalEndpoint) {
        localStorage.setItem('node-endpoint', originalEndpoint);
      }
    } catch (error) {
      console.log('Invalid endpoint error caught in component:', error);
    }
  };

  const testSpecificError = async () => {
    try {
      // This will likely cause a 403 error with specific error message
      await nodeService.listtransfers({ assetId: 'invalid-asset-id' });
    } catch (error) {
      console.log('Specific error caught in component:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Test</CardTitle>
          <CardDescription>
            Test different error scenarios to verify toast notifications are working.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={test504Error}
              variant="outline"
              className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
            >
              Test 504 Gateway Timeout
            </Button>
            
            <Button 
              onClick={testNetworkError}
              variant="outline"
              className="bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
            >
              Test Network Error
            </Button>
            
            <Button 
              onClick={testInvalidEndpoint}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
            >
              Test Invalid Endpoint
            </Button>

            <Button 
              onClick={testSpecificError}
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
            >
              Test Specific API Error (403)
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Expected Behavior:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>504 Error:</strong> Should show "Gateway Timeout: The request timed out. Please try again." toast</li>
              <li>• <strong>Network Error:</strong> Should show "Network Error: Unable to connect to the server." toast</li>
              <li>• <strong>Invalid Endpoint:</strong> Should show appropriate error toast</li>
              <li>• <strong>Specific API Error:</strong> Should show the actual error message from the API (e.g., "Unknown RGB contract ID")</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

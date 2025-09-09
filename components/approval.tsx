import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icons } from './icons';
import { Button } from './ui/button';
import { closeWindow } from '@/utils';

interface WebsiteInfo {
  domain: string;
  favicon: string;
  title?: string;
}

export default function Approval() {
  const location = useLocation();
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const origin = new URLSearchParams(location.search).get('origin') ?? 'unknown origin';

  useEffect(() => {
    const fetchWebsiteInfo = async () => {
      try {
        if (origin && origin !== 'unknown origin') {
          const url = new URL(origin);
          const domain = url.hostname;
          
          // Try to get favicon
          let favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
          
          // Try to get page title (this might not work due to CORS, but worth trying)
          try {
            const response = await fetch(origin, { mode: 'no-cors' });
            // We can't read the response due to CORS, but we can set basic info
          } catch (e) {
            // Ignore CORS errors
          }

          setWebsiteInfo({
            domain,
            favicon,
            title: domain
          });
        }
      } catch (error) {
        console.error('Error fetching website info:', error);
        setWebsiteInfo({
          domain: origin,
          favicon: '',
          title: origin
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteInfo();
  }, [origin]);

  const handleApprove = () => {
    browser.runtime.sendMessage({ type: 'webln-approval-response', approved: true });
    closeWindow()
  };

  const handleDeny = () => {
    browser.runtime.sendMessage({ type: 'webln-approval-response', approved: false });
    closeWindow()
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-background">
        <Icons.refresh className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-border">
        {/* <Icons.wallet className="h-6 w-6 text-primary mr-2" /> */}
        <h1 className="text-lg font-semibold">Lumen Connect</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Website Info Card */}
        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm mb-6">
          <div className="flex items-center mb-4">
            {websiteInfo?.favicon && (
              <img 
                src={websiteInfo.favicon} 
                alt={`${websiteInfo.domain} favicon`}
                className="w-8 h-8 rounded mr-3"
                onError={(e) => {
                  // Fallback to a default icon if favicon fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground text-left">{websiteInfo?.domain || origin}</h2>
              <p className="text-sm text-gray-dark text-left">Connect this site to Lumen</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Icons.check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-muted-foreground">View your RGB Lightning Node</span>
            </div>
            <div className="flex items-center text-sm">
              <Icons.check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-muted-foreground">Request RLN transactions</span>
            </div>
            <div className="flex items-center text-sm">
              <Icons.check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-muted-foreground">Access your RLN assets</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full max-w-sm mb-6">
          <div className="flex items-start">
            <Icons.circleAlert className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Only connect to sites you trust</p>
              <p className="text-xs text-yellow-700 mt-1">
                This site will be able to request transactions and view your wallet information.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 w-full max-w-sm">
          <Button 
            onClick={handleDeny} 
            variant="outline"
            className="flex-1 bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove} 
              className="flex-1"

          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToastActions } from '@/hooks/useToastActions';
import { nodeService } from '@/services/nodeService';
import { closeWindow } from '@/utils';

interface MessageSigningConfirmationProps {
  messageData?: { message: string };
}

export const MessageSigningConfirmation: React.FC<MessageSigningConfirmationProps> = ({ 
  messageData 
}) => {
  const [searchParams] = useSearchParams();
  const { showTransferSuccess, showTransferError } = useToastActions();
  const [isLoading, setIsLoading] = useState(false);

  // Get message data from URL params if not provided directly
  const getMessageData = (): { message: string } | null => {
    if (messageData) return messageData;
    
    const message = searchParams.get('message');
    
    if (!message) {
      return null;
    }

    return { message };
  };

  const msgData = getMessageData();

  const handleSign = async () => {
    if (!msgData) return;

    setIsLoading(true);
    try {
      const result = await nodeService.signmessage(msgData);
      
      // Send success message to background script
      browser.runtime.sendMessage({ 
        type: 'message-signing-response', 
        success: true, 
        result 
      });
      
      showTransferSuccess('Message signed successfully');
      
      // Close popup after a short delay
      closeWindow()
      
    } catch (error: any) {
      console.error('Message signing failed:', error);
      showTransferError(error.message || 'Message signing failed');
      
      // Send error message to background script
      browser.runtime.sendMessage({ 
        type: 'message-signing-response', 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Send cancellation message to background script
    browser.runtime.sendMessage({ 
      type: 'message-signing-response', 
      success: false, 
      error: 'Message signing cancelled by user' 
    });
    
    // Show cancellation message before closing
    showTransferError('Message signing cancelled');
    
    // Close popup after a short delay
    closeWindow()
  };

  if (!msgData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Icons.circleAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Invalid Message</h2>
        <p className="text-muted-foreground text-center mb-4">
          The message data is missing or invalid.
        </p>
        <Button onClick={() => window.close()}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.send className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign Message</h1>
          <p className="text-gray-dark">
            Review the message before signing
          </p>
        </div>

        {/* Message Details */}
        <Card className='rounded-lg shadow-md'>
          {/* <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.wallet className="h-5 w-5" />
              Message to Sign
            </CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-4">
            {/* Message Content */}
            <div className="bg-muted rounded-lg text-left">
              <label className="text-xs text-gray-dark uppercase tracking-wide mb-2 block">Message to Sign</label>
              <div className="bg-background p-3 rounded border font-mono text-sm break-all">
                {msgData.message}
              </div>
            </div>

            {/* Message Length */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-dark uppercase tracking-wide">Message Length</span>
              <Badge variant="secondary">
                {msgData.message.length} characters
              </Badge>
            </div>

            {/* Warning */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icons.circleAlert className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important</p>
                  <p>Only sign messages from trusted sources. Signing a malicious message could compromise your wallet security.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3 w-full ">
        <Button 
            onClick={handleCancel}
            variant="outline"
            disabled={isLoading}
            className="bg-white flex-1"
             size="lg"
          >
            <Icons.x className="mr-2 h-4 w-4 " />
            Cancel
          </Button>
          <Button 
            onClick={handleSign}
            disabled={isLoading}
            className="flex-1 "
            size="lg"
          >
            {isLoading ? (
              <>
                <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Icons.send className="mr-2 h-4 w-4" />
                Sign Message
              </>
            )}
          </Button>
          
       
        </div>

        {/* Security Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing this message, you are cryptographically proving that you control this wallet.
            This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageSigningConfirmation;

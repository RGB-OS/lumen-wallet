import React from 'react';
import { useLocation } from 'react-router-dom';



export default function Approval() {
  const location = useLocation();

  const origin = new URLSearchParams(location.search).get('origin') ?? 'unknown origin';

  const handleApprove = () => {
    browser.runtime.sendMessage({ type: 'webln-approval-response', approved: true });
    window.close();
  };

  const handleDeny = () => {
    browser.runtime.sendMessage({ type: 'webln-approval-response', approved: false });
    window.close();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-white text-center">
      <h1 className="text-lg font-semibold mb-4">Connect Wallet?</h1>
      <p className="mb-6 text-sm text-gray-600">
        Allow <strong>{origin}</strong> to access your RGB wallet?
      </p>
      <div className="flex space-x-4">
        <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded">
          Approve
        </button>
        <button onClick={handleDeny} className="bg-red-500 text-white px-4 py-2 rounded">
          Deny
        </button>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (text: string) => void;
  onError?: (error: unknown) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, onClose }) => {
  const [errorMsg, setErrorMsg] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-md bg-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scan Shipment QR</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        
        {errorMsg && <div className="text-red-500 mb-2">{errorMsg}</div>}
        
        <div className="overflow-hidden rounded-lg aspect-square">
          <Scanner 
            onScan={(result: any) => {
              if (result && result.length > 0) {
                onScan(result[0].rawValue);
              }
            }} 
            onError={(error: any) => {
              setErrorMsg(error?.message || 'Error accessing camera');
              if (onError) onError(error);
            }} 
          />
        </div>
        
        <p className="text-sm text-center text-gray-500 mt-4">
          Position the QR code within the frame to scan.
        </p>
      </div>
    </div>
  );
};

# Transaction and Message Signing Confirmation Flows

## Overview

The Lumen Wallet now includes confirmation flows for both transactions and message signing, similar to common cryptocurrency wallets. When a dapp calls `window.rgbwebln.sendAsset()` or `window.rgbwebln.signMessage()`, instead of automatically executing the action, the wallet will:

1. Open a confirmation popup
2. Display transaction details for user review
3. Allow the user to confirm or reject the transaction
4. Return the result to the dapp

## Flow Details

### 1. Dapp Initiates Transaction or Message Signing

**For Transactions:**
```javascript
const result = await window.rgbwebln.sendAsset({
  recipient_id: "rgb1...",
  asset_id: "asset1...",
  assignment: {
    type: "Fungible",
    value: 1000000
  },
  transport_endpoints: ["rgb1..."],
  fee_rate: 1,
  min_confirmations: 1,
  donation: false,
  skip_sync: false
});
```

**For Message Signing:**
```javascript
const signature = await window.rgbwebln.signMessage("Hello, this is a message to sign");
```

### 2. Wallet Intercepts Request

The wallet service detects this is an external request (not from the wallet's own UI) and triggers the confirmation flow.

### 3. Confirmation Popup Opens

**For Transactions:**
A popup window opens showing:
- Transaction amount and asset details
- Recipient address
- Fee rate selection (Low/Medium/High)
- Confirm/Reject buttons

**For Message Signing:**
A popup window opens showing:
- Message content to be signed
- Message length
- Security warning about signing
- Sign/Cancel buttons

### 4. User Review and Action

**For Transactions:**
The user can:
- Review all transaction details
- Select fee rate (Low: 3 sats/vB, Medium: 5 sats/vB, High: 7 sats/vB)
- Confirm the transaction (executes the sendAsset call)
- Reject the transaction (returns an error to the dapp)

**For Message Signing:**
The user can:
- Review the message content
- See message length and security warnings
- Sign the message (executes the signMessage call)
- Cancel the signing (returns an error to the dapp)

### 5. Result Returned to Dapp

**For Transactions:**
- **Success**: Returns the transaction result (TXId)
- **Rejection**: Returns an error with code `USER_REJECTED` and message "Transaction rejected by user"
- **Failure**: Returns the actual error from the node with appropriate error code

**For Message Signing:**
- **Success**: Returns the signature
- **Cancellation**: Returns an error with code `USER_REJECTED` and message "Message signing cancelled by user"
- **Failure**: Returns the actual error from the node with appropriate error code

## Implementation Details

### Files Modified

1. **`components/asset/TransactionConfirmation.tsx`** - Transaction confirmation UI component
2. **`components/asset/MessageSigningConfirmation.tsx`** - Message signing confirmation UI component
3. **`services/walletService.ts`** - Added `openTransactionConfirmationPopup()` and `openMessageSigningConfirmationPopup()` methods
4. **`entrypoints/popup/App.tsx`** - Added routes for confirmation pages

### Key Methods

#### `openTransactionConfirmationPopup()`
- Creates a popup window with transaction details
- Waits for user confirmation/rejection
- Returns the result to the calling dapp

#### `openMessageSigningConfirmationPopup()`
- Creates a popup window with message details
- Waits for user signing/cancellation
- Returns the signature to the calling dapp

#### `handleCustomRequest()`
- Intercepts `sendasset` and `signmessage` requests from external origins
- Triggers confirmation popup for external requests
- Direct execution for internal wallet requests

### Message Flow

1. **Dapp → Background**: WebLN request via `window.postMessage`
2. **Background → WalletService**: Calls `handleCustomRequest()`
3. **WalletService → Popup**: Opens confirmation window
4. **Popup → Background**: Sends confirmation response
5. **Background → Dapp**: Returns result via `window.postMessage`

## Security Considerations

- Only external origins trigger the confirmation popup
- Internal wallet requests bypass confirmation for better UX
- All transaction details are displayed for user review
- User can reject any transaction
- Confirmation popup is isolated from the dapp's context

## Testing

To test the flows:

**For Transaction Confirmation:**
1. Load the extension in Chrome
2. Open a dapp that uses `window.rgbwebln.sendAsset()`
3. Call the sendAsset method
4. Verify the confirmation popup appears
5. Test both confirm and reject scenarios

**For Message Signing Confirmation:**
1. Load the extension in Chrome
2. Open a dapp that uses `window.rgbwebln.signMessage()`
3. Call the signMessage method
4. Verify the confirmation popup appears
5. Test both sign and cancel scenarios

## Default Values

The wallet provides sensible defaults for missing parameters:

- **fee_rate**: Defaults to 5 sats/vB (Medium)
- **min_confirmations**: Defaults to 1
- **assignment.type**: Defaults to "Fungible"
- **donation**: Defaults to false
- **skip_sync**: Defaults to false

## Future Enhancements

- Add transaction fee estimation
- Support for batch transactions
- Enhanced security warnings for large amounts
- Transaction preview with network fees
- Support for custom confirmation messages from dapps
- Dynamic fee rate calculation based on network conditions

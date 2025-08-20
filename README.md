# WebLN Provider – Developer Documentation (Chrome/WXT)

## Overview

This extension injects a **WebLN provider** into web pages (via `window.webln`) and proxies method calls to the background service (`walletService`). It follows the **WebLN** specification where applicable and implements a subset of methods tailored for RGB/Lightning usage:

* `webln.enable()`
* `webln.isEnabled()`
* `webln.getInfo()`
* `webln.getBalance()`
* `webln.request(method, params)` – generic passthrough for custom node APIs

> Notes
>
> * Permissioning is **per-origin**. The first call to `enable()` opens an **approval popup**.
> * Authentication is enforced via `authService`. If not authenticated, a **login popup** is triggered.
> * Supported `request.*` methods depend on the connected node; see `getInfo().methods`.

---

## Public API Surface

### `webln.enable()`

Requests permission for the current origin to access WebLN features.

**Signature**

```ts
function enable(): Promise<void>;
```

**Behavior**

* Opens an approval popup at `/popup.html#/approval?origin=<origin>`.
* If approved, the origin is added to the `enabledOrigins` set.
* If not authenticated, opens `/popup.html#/login` popup.
* Resolves with no return value.

**Rejects**

* `WalletPermissionError` (code `4100`) if denied.
* `WalletUserRejected` (code `4001`) if explicitly rejected by user.

---

### `webln.isEnabled()`

Returns whether the current origin has permission.

**Signature**

```ts
function isEnabled(): Promise<boolean>;
```

**Resolve**: `true | false`.

---

### `webln.getInfo()`

Fetches metadata about the connected node.

**Signature**

```ts
function getInfo(): Promise<GetInfoResponse>;
```

**`GetInfoResponse`**

```ts
type GetInfoResponse = {
  node: {
    alias: string;
    pubkey: string;
    color?: string;
  };
  methods: string[]; // e.g. "makeInvoice", "sendPayment", "request.rgbinvoice", ...
};
```

**Rejects**

* `WalletPermissionError` if origin not enabled or not authenticated.
* `WalletNodeError` if underlying node RPC fails.

---

### `webln.getBalance()`

Returns wallet balance for the current account.

**Signature**

```ts
function getBalance(): Promise<BalanceResponse>;
```

**`BalanceResponse`**

```ts
type BalanceResponse = {
  balance: number; // sats, from nodeService.btcbalance().vanilla.spendable
  currency?: 'sats' | 'EUR' | 'USD';
};
```

**Rejects**

* `WalletPermissionError` if not enabled/authenticated.
* `WalletNodeError` if node RPC fails.

---

### `webln.request(method, params)`

Generic passthrough for provider-specific or node-specific methods.

**Signature**

```ts
function request<T = unknown>(method: string, params?: any): Promise<T>;
```

**Supported methods (WalletService → nodeService)**:

* `listpeers`
* `listchannels`
* `decodergbinvoice(params)`
* `rgbinvoice(params)`
* `address`
* `listassets`
* `listtransfers(params)`
* `sendasset(params)`
* `refreshtransfers(params)`

**Rejects**

* `WalletPermissionError` if not enabled/authenticated.
* `WalletMethodNotFound` (code `-32601`) if unsupported method.
* `WalletInvalidParams` (code `-32602`) if bad input.
* `WalletNodeError` (code `-32603`) if RPC error.

---

## Error Model

Errors are standardized and surfaced with a `message`, `type`, and numeric `code` (matching [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) conventions where possible):

```ts
export enum WalletErrorCode {
  USER_REJECTED = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  METHOD_NOT_FOUND = -32601,
  INTERNAL_ERROR = -32603,
  INVALID_PARAMS = -32602,
}

class WalletError extends Error {
  code: WalletErrorCode;
}

class WalletPermissionError extends WalletError { code = 4100 }
class WalletUserRejected extends WalletError { code = 4001 }
class WalletMethodNotFound extends WalletError { code = -32601 }
class WalletInvalidParams extends WalletError { code = -32602 }
class WalletNodeError extends WalletError { code = -32603 }
class WalletRequestError extends WalletError { code = 4200 }
```

**Guidelines**

* Use these classes consistently for dapps to reliably detect error cases.
* Do not leak internal stack traces; only return `message`, `type`, `code`.

---

## TypeScript Interfaces (Public)

```ts
export interface WebLNProvider {
  enable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  getInfo(): Promise<GetInfoResponse>;
  getBalance(): Promise<BalanceResponse>;
  request<T = unknown>(method: string, params?: any): Promise<T>;
}

export type BalanceResponse = {
  balance: number;
  currency?: 'sats' | 'EUR' | 'USD';
};

export type GetInfoResponse = {
  node: { alias: string; pubkey: string; color?: string };
  methods: string[];
};
```

---

## Example: Dapp Usage

```ts
async function connectAndFetch() {
  if (!('webln' in window)) throw new Error('WebLN not available');
  const webln = window.webln as WebLNProvider;

  const enabled = (await webln.isEnabled()) ?? false;
  if (!enabled) await webln.enable();

  const info = await webln.getInfo();
  console.log('Node alias:', info.node.alias);

  const bal = await webln.getBalance();
  console.log('Balance (sats):', bal.balance);

  const assets = await webln.request('listassets');
  console.log('Assets:', assets);
}
```

---

## Security & Privacy

* **Approval Popup**: Always shown on first `enable()` call.
* **Authentication enforced**: If session missing, triggers login popup.
* **Per-origin** permission store in `enabledOrigins`.
* **Strict validation**: Unknown methods → `WalletMethodNotFound`.
* **Error codes**: Numeric, stable across releases.

---

## Background Service (`walletService`) Contract

```ts
interface WalletService {
  enable(origin: string): Promise<void>;
  isEnabled(origin: string): Promise<boolean>;
  getInfo(origin: string): Promise<GetInfoResponse>;
  getBalance(origin: string): Promise<BalanceResponse>;
  handleCustomRequest(origin: string, method: string, params?: any): Promise<unknown>;
}
```

---

## Changelog (Provider API)

* **v0.1.0**: Initial release with `enable`, `isEnabled`, `getInfo`, `getBalance`, `request` mapped to `walletService` methods.

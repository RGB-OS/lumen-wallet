import { WalletErrorCode } from "./wallet-error-codes";


export class WalletError extends Error {
  code: number;
  constructor(message: string, code: number = WalletErrorCode.INTERNAL_ERROR) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class WalletPermissionError extends WalletError {
  constructor(message = 'Wallet permission denied') {
    super(message, WalletErrorCode.UNAUTHORIZED);
  }
}

export class WalletUserRejected extends WalletError {
  constructor(message = 'User rejected the request') {
    super(message, WalletErrorCode.USER_REJECTED);
  }
}

export class WalletMethodNotFound extends WalletError {
  constructor(method: string) {
    super(`Method "${method}" not found`, WalletErrorCode.METHOD_NOT_FOUND);
  }
}

export class WalletInvalidParams extends WalletError {
  constructor(message = 'Invalid parameters') {
    super(message, WalletErrorCode.INVALID_PARAMS);
  }
}

export class WalletNodeError extends WalletError {
  constructor(operation: string, message?: string) {
    super(
      `Failed to ${operation}: ${message ?? 'unknown error'}`,
      WalletErrorCode.INTERNAL_ERROR
    );
    this.name = 'WalletNodeError';
  }
}

export class WalletRequestError extends WalletError {
  constructor(method: string, message?: string) {
    super(
      `Failed to handle request for method ${method}: ${message ?? 'unknown error'}`,
      WalletErrorCode.UNSUPPORTED_METHOD
    );
    this.name = 'WalletRequestError';
  }
}
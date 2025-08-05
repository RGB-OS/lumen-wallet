export const satoshisToBTC = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

export const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
};
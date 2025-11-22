export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
  isNative?: boolean;
  isStablecoin?: boolean;
}

export const tokens: Token[] = [
  {
    symbol: "CELO",
    name: "Celo",
    address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png",
    isNative: true,
  },
  {
    symbol: "cUSD",
    name: "Celo Dollar",
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png",
    isStablecoin: true,
  },
  {
    symbol: "cEUR",
    name: "Celo Euro",
    address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cEUR.png",
    isStablecoin: true,
  },
  {
    symbol: "CMT",
    name: "Celo MX Token",
    address: "0xe8f33f459ffa69314f3d92eb51633ae4946de8f0",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cREAL.png",
    isStablecoin: false,
  },
  {
    symbol: "X402",
    name: "X402 Token",
    address: "0x37290B3f613344Ef22750f732aa9dF846f80DDA0",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png",
    isStablecoin: false,
  },
];

export default { tokens };

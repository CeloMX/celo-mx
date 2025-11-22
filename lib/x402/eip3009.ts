import { type Address } from 'viem';

export const EIP3009_ABI = [
  {
    type: 'function',
    name: 'transferWithAuthorization',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export function splitSignature(signature: `0x${string}`) {
  const s = signature.slice(2);
  const r = ('0x' + s.slice(0, 64)) as `0x${string}`;
  const sHex = ('0x' + s.slice(64, 128)) as `0x${string}`;
  const v = parseInt(s.slice(128, 130), 16);
  return { v, r, s: sHex };
}

export function buildEip712Domain({ name, version, chainId, verifyingContract }: { name: string; version: string; chainId: number; verifyingContract: Address }) {
  return { name, version, chainId, verifyingContract } as const;
}

export const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;


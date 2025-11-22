import { NextResponse } from 'next/server';
import { settleAuthorization } from '@/lib/x402/facilitator';
import { type Address } from 'viem';

function decodePaymentHeader(header: string | null) {
  if (!header) return null;
  try {
    const maybeJson = header.startsWith('{') ? header : Buffer.from(header, 'base64').toString('utf-8');
    const obj = JSON.parse(maybeJson);
    return obj;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  const paymentHeader = headers.get('x-payment');
  const recipient = process.env.X402_RECIPIENT_ADDRESS as Address | undefined;
  if (!recipient) return NextResponse.json({ error: 'recipient_not_configured' }, { status: 500 });

  if (paymentHeader) {
    const payload = decodePaymentHeader(paymentHeader);
    if (!payload) return NextResponse.json({ error: 'payment_payload_invalid' }, { status: 402 });

    try {
      const { txHash } = await settleAuthorization({
        tokenAddress: payload.domain?.verifyingContract || payload.tokenAddress,
        eip712Name: payload.eip712?.name || 'USD Coin',
        eip712Version: payload.eip712?.version || '2',
        from: payload.message?.from,
        to: payload.message?.to ?? recipient,
        value: BigInt(payload.message?.value || '0'),
        validAfter: BigInt(payload.message?.validAfter || '0'),
        validBefore: BigInt(payload.message?.validBefore || Math.floor(Date.now() / 1000 + 900)),
        nonce: payload.message?.nonce,
        signature: payload.signature,
        chainId: payload.domain?.chainId ?? 84532,
      });
      return NextResponse.json({ ok: true, txHash }, { status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'settle_failed' }, { status: 402 });
    }
  }

  const chainId = 84532; // Base Sepolia for testing
  return NextResponse.json({
    payment: {
      network: `base:${chainId}`,
      token: 'USDC',
      amount: '0.01',
      recipient,
      eip712: { name: 'USD Coin', version: '2' },
      chainId,
    },
  }, { status: 402 });
}

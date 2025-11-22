import { NextResponse } from 'next/server';
import { type Address } from 'viem';
import { tokens } from '@/config/tokens';
import { settleAuthorization } from '@/lib/x402/facilitator';

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
  const recipient = ('0xc5CE44D994C00F2FeA2079408e8b6c18b6D2F156') as Address | undefined;
  if (!recipient) return NextResponse.json({ error: 'recipient_not_configured' }, { status: 500 });

  const x402Token = tokens.find(t => t.symbol === 'X402');
  if (!x402Token) return NextResponse.json({ error: 'token_not_configured' }, { status: 500 });

  if (paymentHeader) {
    const payload = decodePaymentHeader(paymentHeader);
    if (!payload) return NextResponse.json({ error: 'payment_payload_invalid' }, { status: 402 });

    try {
      const { txHash } = await settleAuthorization({
        tokenAddress: (payload.domain?.verifyingContract || x402Token.address) as Address,
        eip712Name: payload.eip712?.name || 'X402 Token',
        eip712Version: payload.eip712?.version || '2',
        from: payload.message?.from,
        to: payload.message?.to ?? recipient,
        value: BigInt(payload.message?.value || '0'),
        validAfter: BigInt(payload.message?.validAfter || '0'),
        validBefore: BigInt(payload.message?.validBefore || Math.floor(Date.now() / 1000 + 900)),
        nonce: payload.message?.nonce,
        signature: payload.signature,
        chainId: payload.domain?.chainId ?? 42220,
      });
      return NextResponse.json({ ok: true, txHash }, { status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'settle_failed' }, { status: 402 });
    }
  }

  return NextResponse.json({
    payment: {
      network: 'celo:42220',
      token: 'X402',
      amount: '1.00',
      recipient,
      eip712: { name: 'X402 Token', version: '2' },
      chainId: 42220,
      tokenAddress: x402Token.address,
    },
  }, { status: 402 });
}

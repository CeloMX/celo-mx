import { NextResponse } from 'next/server';
import { buildX402Offer, verifyX402Payment } from '@/lib/x402-helpers';
import { type Address } from 'viem';

export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  const proof = headers.get('x-payment') || undefined;
  const recipient = (process.env.X402_RECIPIENT_ADDRESS || '0xc5CE44D994C00F2FeA2079408e8b6c18b6D2F156') as Address | undefined;
  if (!recipient) return NextResponse.json({ error: 'recipient_not_configured' }, { status: 500 });

  if (proof) {
    const ok = await verifyX402Payment(proof, {
      expectedRecipient: recipient,
      expectedTokenSymbol: 'X402',
      expectedAmount: '1.00',
    });
    if (ok) return NextResponse.json({ payload: 'cmt_access_granted' }, { status: 200 });
    return NextResponse.json({ error: 'payment_invalid' }, { status: 402 });
  }

  const offer = buildX402Offer({ amount: '1.00', tokenSymbol: 'X402', recipient });
  return NextResponse.json({ payment: offer }, { status: 402 });
}

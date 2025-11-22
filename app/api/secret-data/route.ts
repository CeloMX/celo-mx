import { NextResponse } from 'next/server';
import { buildX402Offer, verifyX402Payment } from '@/lib/x402-helpers';
import { type Address } from 'viem';

export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  const paymentProof = headers.get('x-payment') || undefined;
  const recipient = (process.env.X402_RECIPIENT_ADDRESS || process.env.NEXT_PUBLIC_CMT_FAUCET_ADDRESS_MAINNET) as Address | undefined;

  if (!recipient) {
    return NextResponse.json({ error: 'recipient_not_configured' }, { status: 500 });
  }

  if (paymentProof) {
    const ok = await verifyX402Payment(paymentProof, {
      expectedRecipient: recipient,
      expectedTokenSymbol: 'cUSD',
      expectedAmount: '1.00',
    });
    if (ok) {
      return NextResponse.json({ secret: 'contenido protegido' }, { status: 200 });
    }
    return NextResponse.json({ error: 'payment_invalid' }, { status: 402 });
  }

  const offer = buildX402Offer({ amount: '1.00', tokenSymbol: 'cUSD', recipient });
  return NextResponse.json({ payment: offer }, { status: 402 });
}


import { NextResponse } from 'next/server';
import { verifyX402Payment } from '@/lib/x402-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ok = await verifyX402Payment(body.proof, {
      expectedRecipient: body.recipient,
      expectedTokenSymbol: body.tokenSymbol,
      expectedAmount: body.amount,
    });
    return NextResponse.json({ ok }, { status: ok ? 200 : 402 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'verify_failed' }, { status: 400 });
  }
}


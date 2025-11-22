import { NextResponse } from 'next/server';
import { settleAuthorization } from '@/lib/x402/facilitator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { txHash } = await settleAuthorization({
      tokenAddress: body.tokenAddress,
      eip712Name: body.eip712Name,
      eip712Version: body.eip712Version,
      from: body.from,
      to: body.to,
      value: BigInt(body.value),
      validAfter: BigInt(body.validAfter),
      validBefore: BigInt(body.validBefore),
      nonce: body.nonce,
      signature: body.signature,
      chainId: body.chainId,
    });
    return NextResponse.json({ txHash }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'settle_failed' }, { status: 400 });
  }
}


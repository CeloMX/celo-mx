import { NextResponse } from 'next/server';
import { facilitatorStatus } from '@/lib/x402/facilitator';

export async function GET() {
  const s = await facilitatorStatus();
  return NextResponse.json(s, { status: s.ok ? 200 : 500 });
}


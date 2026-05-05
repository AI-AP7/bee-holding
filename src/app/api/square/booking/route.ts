import { NextResponse } from "next/server";

function disabledSquareProxyResponse() {
  return NextResponse.json(
    { error: "Direct Square booking proxy is disabled. Use /api/booking for protected booking creation." },
    { status: 410 }
  );
}

export async function POST() {
  return disabledSquareProxyResponse();
}

export async function GET() {
  return disabledSquareProxyResponse();
}

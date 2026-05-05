import { NextResponse } from "next/server";

function disabledSquareProxyResponse() {
  return NextResponse.json(
    { error: "Direct Square customer proxy is disabled. Customer records are managed during protected booking creation." },
    { status: 410 }
  );
}

export async function POST() {
  return disabledSquareProxyResponse();
}

export async function GET() {
  return disabledSquareProxyResponse();
}

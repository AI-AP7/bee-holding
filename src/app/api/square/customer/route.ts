import { NextRequest, NextResponse } from "next/server";

const squareEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN || "";

const squareApiBase =
  squareEnvironment === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";

interface CreateCustomerRequest {
  emailAddress: string;
  givenName: string;
  familyName?: string;
  phoneNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!squareAccessToken) {
      return NextResponse.json({ error: "Square access token is not configured." }, { status: 500 });
    }

    const body = (await request.json()) as CreateCustomerRequest;
    const { emailAddress, givenName, familyName, phoneNumber } = body;

    if (!emailAddress || !givenName) {
      return NextResponse.json({ error: "Missing required fields: emailAddress and givenName." }, { status: 400 });
    }

    const response = await fetch(`${squareApiBase}/customers`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        Authorization: `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        given_name: givenName,
        family_name: familyName || undefined,
        email_address: emailAddress,
        phone_number: phoneNumber || undefined,
      }),
    });

    const data = (await response.json()) as { customer?: unknown; errors?: Array<{ detail?: string }> };
    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Failed to create customer." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, customer: data.customer });
  } catch (error) {
    console.error("Customer API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!squareAccessToken) {
      return NextResponse.json({ error: "Square access token is not configured." }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Missing email parameter." }, { status: 400 });
    }

    const response = await fetch(`${squareApiBase}/customers/search`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        Authorization: `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          filter: {
            email_address: {
              exact: email,
            },
          },
        },
      }),
    });

    const data = (await response.json()) as { customers?: unknown[]; errors?: Array<{ detail?: string }> };
    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Failed to fetch customer." },
        { status: response.status }
      );
    }

    const customer = data.customers?.[0] || null;
    return NextResponse.json({ success: true, customer, isNew: !customer });
  } catch (error) {
    console.error("Customer fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

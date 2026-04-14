import { NextRequest, NextResponse } from "next/server";

const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";

const SQUARE_API_BASE_V1 = SQUARE_ENV === "production"
  ? "https://connect.squareup.com/v1"
  : "https://connect.squareupsandbox.com/v1";

const SQUARE_API_BASE_V2 = SQUARE_ENV === "production"
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
    const body = await request.json();
    const { emailAddress, givenName, familyName, phoneNumber } = body as CreateCustomerRequest;

    if (!emailAddress || !givenName) {
      return NextResponse.json(
        { error: "Missing required fields: emailAddress, givenName" },
        { status: 400 }
      );
    }

    const customerData: Record<string, string> = {
      email_address: emailAddress,
      given_name: givenName,
    };

    if (familyName) customerData.family_name = familyName;
    if (phoneNumber) customerData.phone_number = phoneNumber;

    const response = await fetch(`${SQUARE_API_BASE_V1}/customers`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        given_name: givenName,
        email_address: emailAddress,
        family_name: familyName || undefined,
        phone_number: phoneNumber || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square customer error:", data);
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Failed to create customer" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data.customer,
    });
  } catch (error) {
    console.error("Customer API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${SQUARE_API_BASE_V2}/customers?email_address=${encodeURIComponent(email)}`,
      {
        headers: {
          "Square-Version": "2024-01-18",
          "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Failed to fetch customer" },
        { status: response.status }
      );
    }

    const customer = data.customers?.[0] || null;

    return NextResponse.json({
      success: true,
      customer,
      isNew: !customer,
    });
  } catch (error) {
    console.error("Customer fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

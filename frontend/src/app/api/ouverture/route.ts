import { NextResponse } from "next/server";
import { handleOuvertureRequest } from "../../../lib/ouverture";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { status, message } = await handleOuvertureRequest(body);
  return NextResponse.json({ message }, { status });
}

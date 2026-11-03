import { NextResponse } from "next/server";
import openApiSpec from "@/../docs/openapi.json";

export async function GET() {
  return NextResponse.json(openApiSpec);
}

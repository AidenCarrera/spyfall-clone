import { NextResponse } from "next/server";
import { redis } from "@/src/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Perform a lightweight Redis command to ensure connectivity.
    await redis.get("health_check");

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Redis connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

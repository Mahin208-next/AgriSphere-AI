import { getDb, DatabaseEvent } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const db = getDb();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection event
  writer.write(
    encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`)
  );

  // Keep-alive heartbeat to prevent idle disconnect loops
  const pingInterval = setInterval(() => {
    try {
      writer.write(encoder.encode(": ping\n\n"));
    } catch {
      clearInterval(pingInterval);
    }
  }, 20000);

  const unsubscribe = db.subscribe((event: DatabaseEvent) => {
    try {
      const payload = `event: ${event.type.toLowerCase()}\ndata: ${JSON.stringify(event)}\n\n`;
      writer.write(encoder.encode(payload));
    } catch (err) {
      console.error("SSE stream write error:", err);
    }
  });

  req.signal.addEventListener("abort", () => {
    clearInterval(pingInterval);
    unsubscribe();
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


import { NextRequest } from 'next/server';
import { communityBus, CommunityEvent } from '@/lib/communityEvents';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let listener: ((event: CommunityEvent) => void) | null = null;
  let pingInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection ACK
      controller.enqueue(encoder.encode(': connected\n\n'));

      // 2. Register listener on the community bus
      listener = (event: CommunityEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Client disconnected
        }
      };

      communityBus.on('community_event', listener);

      // 3. Heartbeat keepalive every 20s to prevent gateway timeout
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          if (pingInterval) clearInterval(pingInterval);
        }
      }, 20000);

      // 4. Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        if (pingInterval) clearInterval(pingInterval);
        if (listener) communityBus.off('community_event', listener);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      if (pingInterval) clearInterval(pingInterval);
      if (listener) communityBus.off('community_event', listener);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Bypass Nginx reverse-proxy buffering
    },
  });
}

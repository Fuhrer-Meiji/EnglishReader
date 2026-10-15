import { EventEmitter } from 'node:events';

export type CommunityEventType =
  | 'new_thought'
  | 'like_thought'
  | 'new_post'
  | 'like_post'
  | 'chat_message'
  | 'new_comment';

export interface CommunityEvent {
  type: CommunityEventType;
  payload: any;
  timestamp: number;
}

// Global singleton across hot-reloads and requests
const globalKey = Symbol.for('english_reader.community_bus');
const globalObj = globalThis as unknown as { [globalKey]?: EventEmitter };

if (!globalObj[globalKey]) {
  const bus = new EventEmitter();
  bus.setMaxListeners(200); // Support high number of concurrent reader streams
  globalObj[globalKey] = bus;
}

export const communityBus: EventEmitter = globalObj[globalKey]!;

export function broadcastCommunityEvent(type: CommunityEventType, payload: any): void {
  const event: CommunityEvent = {
    type,
    payload,
    timestamp: Date.now(),
  };
  communityBus.emit('community_event', event);
}

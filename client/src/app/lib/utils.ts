export enum MessageSubscriptionsEnum {
  MESSAGE_SEND = 'message_send',
  MESSAGE_TYPING = 'message_typing',
  MESSAGE_SEEN = 'message_seen',
  MESSAGE_DELIVERED = 'message_delivered',
  SYNC_DATA='sync_data',
  OFFER_CALL="offer_call",
  ANSWER_CALL='answer_call',
  ICE_CANDIDATE="ice_candidate",
}

export enum MessageEventEnums {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnect',
  MESSAGE_NEW = 'message_new', // sending new message to chat or group
  MESSAGE_TYPING = 'message_typing',
  MESSAGE_SEEN = 'message_seen',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_RECEIVED = 'message_received', // me send message to server, after ack from server
  SYNC_DATA='sync_data',
  OFFER_CALL="offer_call",
    ANSWER_CALL='answer_call',
    ICE_CANDIDATE="ice_candidate",

  TOKEN_UNAUTHORIZED = 'token_unauthorized',
  ERROR = 'error',
}

export const sortByDate = <T>(
  data: T[],
  dateField: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return data.sort((a, b) => {
    const dateA = new Date(a[dateField] as any).getTime();
    const dateB = new Date(b[dateField] as any).getTime();
    if (order === 'asc') {
      return dateA - dateB; // ascending order
    } else {
      return dateB - dateA;
    }
  });
};

export const tryCatch = async <T>(
  fn: (...args: any[]) => Promise<T>
): Promise<[T | undefined, any]> => {
  try {
    const result = await fn();
    return [result, undefined];
  } catch (error) {
    return [undefined, error];
  }
};


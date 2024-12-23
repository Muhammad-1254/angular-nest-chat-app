

export enum MessageSubscriptionsEnum{
    MESSAGE_SEND='message_send',
    MESSAGE_TYPING='message_typing',
    MESSAGE_SEEN='message_seen',
    MESSAGE_DELIVERED='message_delivered',
    SYNC_DATA='sync_data',
    OFFER_CALL="offer_call",
    ANSWER_CALL='answer_call',
    ICE_CANDIDATE="ice_candidate",
    END_CALL="end_call",
    CALL_ENDED="call_ended",
    Upload_FILE="upload_file",
}


export enum MessageEventEnums{
    CONNECTED='connected',
    DISCONNECTED='disconnect',
    MESSAGE_NEW='message_new',
    MESSAGE_SENT='message_sent',
    MESSAGE_TYPING='message_typing',
    MESSAGE_SEEN='message_seen',
    MESSAGE_DELIVERED='message_delivered',
    MESSAGE_RECEIVED='message_received',
    SYNC_DATA='sync_data',
    OFFER_CALL="offer_call",
    ANSWER_CALL='answer_call',
    ICE_CANDIDATE="ice_candidate",
    END_CALL="end_call",
    CALL_ENDED="call_ended",

    TOKEN_UNAUTHORIZED='token_unauthorized',
    ERROR='error',


}


export enum MessageStatusEnum{
    CONNECTED='connected',    
    DISCONNECTED='disconnected',
      
    OK=200,
   
    ERROR='error',
    BAD_REQUEST=400,
    UNAUTHORIZED=401,


}
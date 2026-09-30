export const hopByHopHeaders: string[] = [
  'transfer-encoding',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  // RFC 2616 §13.5.1 spells this "Trailers", but the actual header field is "Trailer".
  // Both are listed: forwarding "Trailer" onto our own fixed-length response makes Node
  // throw ERR_HTTP_TRAILER_INVALID from res.end().
  'trailer',
  'trailers',
  'upgrade',
  'content-encoding',
];

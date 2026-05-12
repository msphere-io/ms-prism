import type { Response } from 'node-fetch';
import { is as typeIs } from 'type-is';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { mapValues } from 'lodash';
import { pipe } from 'fp-ts/function';
import { Dictionary } from '@stoplight/types';
import { IHttpResponse } from '../types';

type ParsableResponse = Pick<Response, 'headers' | 'json' | 'text' | 'status'> & {
  buffer?: () => Promise<Buffer>;
};

const BINARY_CONTENT_TYPES = [
  'application/octet-stream',
  'multipart/form-data',
  'multipart/*',
  'application/x-www-form-urlencoded',
  'application/pdf',
];

export const parseResponseBody = (
  response: ParsableResponse,
  skipBinaryValidation = false
): TE.TaskEither<Error, unknown> =>
  TE.tryCatch(() => {
    const contentType = response.headers.get('content-type') || '';
    const isJson = response.status !== 204 && typeIs(contentType, ['application/json', 'application/*+json']);

    if (isJson) {
      return response.json();
    }

    const isSkippableBinaryType = Boolean(typeIs(contentType, BINARY_CONTENT_TYPES));

    if (!skipBinaryValidation || !isSkippableBinaryType || typeof response.buffer !== 'function') {
      return response.text();
    }

    // Binary payloads must be preserved as bytes (not UTF-8 text) to avoid corruption.
    return response.buffer();
  }, E.toError);

export const parseResponseHeaders = (headers: Dictionary<string[]>): Dictionary<string> =>
  mapValues(headers, hValue => hValue.join(','));

export const parseResponse = (
  response: ParsableResponse,
  skipBinaryValidation = false
): TE.TaskEither<Error, IHttpResponse> =>
  pipe(
    parseResponseBody(response, skipBinaryValidation),
    TE.map(body => ({
      statusCode: response.status,
      headers: parseResponseHeaders(response.headers.raw()),
      body,
    }))
  );

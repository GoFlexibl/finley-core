import { describe, expect, it } from 'vitest';
import { createTalkToDataClient } from './client';
import type { FinleyHttpClient } from './types';

const failingWith = (status: number): FinleyHttpClient => ({
  get: () => Promise.reject({ response: { status } }),
  post: () => Promise.reject({ response: { status } }),
});

describe('user copy for HTTP errors', () => {
  it('a 403 says the user has no access, without naming an account', async () => {
    const client = createTalkToDataClient(failingWith(403));
    await expect(client.queryTalkToData('hi')).rejects.toThrow('You do not have access to this.');
  });
});

import { Redis } from '@upstash/redis';

if (!process.env.SPYFALL_KV_REST_API_URL || !process.env.SPYFALL_KV_REST_API_TOKEN) {
    throw new Error('SPYFALL_KV_REST_API_URL and SPYFALL_KV_REST_API_TOKEN must be defined');
}

export const redis = new Redis({
    url: process.env.SPYFALL_KV_REST_API_URL,
    token: process.env.SPYFALL_KV_REST_API_TOKEN,
});

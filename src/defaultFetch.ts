import { customFetch } from './customNodeFetch.js';

import type { RequestInfo, RequestInit } from 'undici';
import type { ResponseLike } from './shared.js';

export function getDefaultFetch(): (input: RequestInfo | URL, init?: RequestInit) => Promise<ResponseLike> {
	// @ts-ignore
	if (typeof Bun !== 'undefined' || typeof Deno !== 'undefined') return fetch;
	// @ts-ignore
	else return customFetch;
}

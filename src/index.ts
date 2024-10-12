import { Blob } from 'node:buffer';
import { FormData } from 'undici';

import { shouldUseGlobalFetchAndWebSocket } from '@discordjs/util';

import { customFetch } from './customNodeFetch.js';
import { setDefaultStrategy } from './environment.js';

// TODO(ckohen): remove once node engine req is bumped to > v18
(globalThis as any).FormData ??= FormData;
globalThis.Blob ??= Blob;

setDefaultStrategy(shouldUseGlobalFetchAndWebSocket() ? fetch : customFetch);

export * from './shared.js';

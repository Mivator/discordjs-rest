import { getDefaultFetch } from "./defaultFetch.js";
import { setDefaultStrategy } from "./environment.js";

setDefaultStrategy(getDefaultFetch());

export * from './shared.js';

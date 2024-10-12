import { customFetch } from "../src/customNodeFetch.js";
import { setDefaultStrategy } from "../src/environment.js";

setDefaultStrategy(customFetch);

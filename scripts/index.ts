const magiqlCjs = `var e=require("./client"),t=require("./hooks");Object.keys(e).forEach((function(t){"default"!==t&&Object.defineProperty(exports,t,{enumerable:!0,get:function(){return e[t]}})})),Object.keys(t).forEach((function(e){"default"!==e&&Object.defineProperty(exports,e,{enumerable:!0,get:function(){return t[e]}})}));
//# sourceMappingURL=magiql.js.map
`;
const magiqlEsm = `export*from"./client";export*from"./hooks";
//# sourceMappingURL=magiql.js.map
`;
const magiqlEsmSourceMap = `{"version":3,"file":"magiql.js","sources":[],"sourcesContent":[],"names":[],"mappings":""}`;
const magiqlCjsSourceMap = `{"version":3,"file":"magiql.js","sources":[],"sourcesContent":[],"names":[],"mappings":""}`;

import { ensureDirSync } from 'https://deno.land/std/fs/ensure_dir.ts';

const encoder = new TextEncoder();
ensureDirSync('./dist/esm');
ensureDirSync('./dist/cjs');
Deno.writeFileSync('./dist/esm/magiql.js', encoder.encode(magiqlEsm));
Deno.writeFileSync('./dist/esm/magiql.js.map', encoder.encode(magiqlEsmSourceMap));

Deno.writeFileSync('./dist/cjs/magiql.js', encoder.encode(magiqlCjs));
Deno.writeFileSync('./dist/cjs/magiql.js.map', encoder.encode(magiqlCjsSourceMap));
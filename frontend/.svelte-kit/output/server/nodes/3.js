import * as universal from '../entries/pages/stocks/_symbol_/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/stocks/_symbol_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/stocks/[symbol]/+page.ts";
export const imports = ["_app/immutable/nodes/3.CU6OOfIn.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/1n5fatFf.js","_app/immutable/chunks/D04qvHq7.js","_app/immutable/chunks/KE_gHlFX.js","_app/immutable/chunks/DQt1jMsg.js","_app/immutable/chunks/DEin6bZh.js","_app/immutable/chunks/IUAQ_459.js","_app/immutable/chunks/2lPQ2NxW.js"];
export const stylesheets = [];
export const fonts = [];

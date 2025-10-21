export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BAJ-RnuF.js",app:"_app/immutable/entry/app.ClaByjcc.js",imports:["_app/immutable/entry/start.BAJ-RnuF.js","_app/immutable/chunks/CTnVdyQk.js","_app/immutable/chunks/KE_gHlFX.js","_app/immutable/chunks/D04qvHq7.js","_app/immutable/entry/app.ClaByjcc.js","_app/immutable/chunks/D04qvHq7.js","_app/immutable/chunks/KE_gHlFX.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/2lPQ2NxW.js","_app/immutable/chunks/IUAQ_459.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/stocks/[symbol]",
				pattern: /^\/stocks\/([^/]+?)\/?$/,
				params: [{"name":"symbol","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

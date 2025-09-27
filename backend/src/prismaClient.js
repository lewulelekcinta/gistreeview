import { PrismaClient } from "@prisma/client";

// Lazy, resilient Prisma proxy for serverless environments.
// Instead of instantiating PrismaClient at module load (which can throw
// or cause prepared-statement collisions), we create the client on first use
// and export a proxy that forwards calls. If initialization fails we return
// rejected promises with informative messages rather than crashing the import.

let _prisma = globalThis.__prismaClient || null;
let _initError = null;
let _initializing = false;

async function initPrisma() {
	if (_prisma) return _prisma;
	if (_initError) throw _initError;
	if (_initializing) {
		// wait for previous attempt
		while (_initializing) await new Promise((r) => setTimeout(r, 50));
		if (_prisma) return _prisma;
		if (_initError) throw _initError;
	}
	_initializing = true;
	try {
		const client = new PrismaClient();
		// try to connect quickly to surface auth/network errors; don't fail hard
		try {
			await client.$connect();
		} catch (e) {
			// log and continue; queries will still surface errors
			console.warn('Prisma $connect warning:', e && e.message ? e.message : e);
		}
		_prisma = client;
		if (process.env.NODE_ENV !== 'production') globalThis.__prismaClient = _prisma;
		return _prisma;
	} catch (e) {
		_initError = e;
		console.error('Prisma initialization failed:', e && e.message ? e.message : e);
		throw e;
	} finally {
		_initializing = false;
	}
}

// The proxy supports model access like prisma.tree.findMany(...) and
// top-level methods like prisma.$queryRaw(...).
const prismaProxy = new Proxy({}, {
	get(_, prop) {
		if (typeof prop === 'symbol') return undefined;
		// Top-level methods that start with $ (e.g. $queryRaw, $connect)
		if (String(prop).startsWith('$')) {
			return async (...args) => {
				const client = await initPrisma();
				const fn = client[prop];
				if (typeof fn !== 'function') throw new Error(`Prisma client missing method ${String(prop)}`);
				return fn.apply(client, args);
			};
		}
		// Return a proxy for model methods: prisma.model.method(...)
		return new Proxy({}, {
			get(__, method) {
				if (typeof method === 'symbol') return undefined;
				return async (...args) => {
					const client = await initPrisma();
					const model = client[prop];
					if (!model) throw new Error(`Prisma client has no model ${String(prop)}`);
					const fn = model[method];
					if (typeof fn !== 'function') throw new Error(`Prisma client missing ${String(prop)}.${String(method)}`);
					return fn.apply(model, args);
				};
			}
		});
	}
});

export default prismaProxy;

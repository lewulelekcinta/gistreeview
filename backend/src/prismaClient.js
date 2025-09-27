import { PrismaClient } from "@prisma/client";

// Reuse PrismaClient across module reloads / serverless invocations when possible.
// This avoids the "prepared statement \"s0\" already exists" errors caused by
// multiple PrismaClient instances creating prepared statements with the same names
// on the same Postgres connection pool.

let prisma;
if (globalThis.__prismaClient) {
	prisma = globalThis.__prismaClient;
} else {
	prisma = new PrismaClient();
	// In non-production environments, store on globalThis to survive hot reloads
	// and prevent creating multiple clients during development.
	if (process.env.NODE_ENV !== "production") {
		globalThis.__prismaClient = prisma;
	}
}

export default prisma;

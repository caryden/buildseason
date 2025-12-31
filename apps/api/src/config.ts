/**
 * Centralized typed environment configuration
 * All environment variables are validated and exported through this module
 */

interface Config {
  // Database
  databaseUrl: string;
  tursoAuthToken?: string;

  // Authentication
  betterAuthSecret: string;
  betterAuthUrl: string;

  // OAuth Providers
  github: {
    clientId: string;
    clientSecret: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
  };

  // Server
  port: number;
  nodeEnv: "development" | "production" | "test";

  // CORS
  corsOrigins: string[];
}

function getConfig(): Config {
  const nodeEnv = (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test";

  const config: Config = {
    // Database
    databaseUrl: process.env.DATABASE_URL || "file:local.db",
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,

    // Authentication
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    // OAuth Providers
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },

    // Server
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv,

    // CORS - parse comma-separated origins from env var
    // In development, default to localhost origins; in production, require explicit config
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
      : nodeEnv === "development"
        ? ["http://localhost:5173", "http://localhost:3000"]
        : [],
  };

  // Validate required environment variables in production
  if (nodeEnv === "production") {
    const requiredVars = [
      "DATABASE_URL",
      "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL",
    ];

    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  return config;
}

export const config = getConfig();
export type { Config };

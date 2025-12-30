import { createAuthClient } from "better-auth/react";

// Create the auth client that connects to our API
export const authClient = createAuthClient({
  baseURL: "", // Empty string = same origin, Vite proxies /api to backend
});

// Export commonly used hooks and methods
export const { signIn, signOut, useSession } = authClient;

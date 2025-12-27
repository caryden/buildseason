import { Hono } from "hono";
import { Layout } from "../components/Layout";

const app = new Hono();

// Registration page
app.get("/register", (c) => {
  const error = c.req.query("error");

  return c.html(
    <Layout title="Create Account - BuildSeason">
      <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 class="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" class="text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{decodeURIComponent(error)}</p>
              </div>
            )}

            <form
              id="register-form"
              hx-post="/api/auth/sign-up/email"
              hx-target="#form-result"
              hx-swap="innerHTML"
              class="space-y-6"
            >
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <div class="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autocomplete="name"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div class="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div class="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    required
                    minlength={8}
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div id="form-result"></div>

              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span>Create account</span>
                  <span class="htmx-indicator">
                    <svg
                      class="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
});

// Login page
app.get("/login", (c) => {
  const error = c.req.query("error");
  const message = c.req.query("message");

  return c.html(
    <Layout title="Sign In - BuildSeason">
      <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 class="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <a href="/register" class="text-blue-600 hover:text-blue-500">
              Create one
            </a>
          </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {message && (
              <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">
                  {decodeURIComponent(message)}
                </p>
              </div>
            )}

            {error && (
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{decodeURIComponent(error)}</p>
              </div>
            )}

            <form
              id="login-form"
              hx-post="/api/auth/sign-in/email"
              hx-target="#form-result"
              hx-swap="innerHTML"
              class="space-y-6"
            >
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div class="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div class="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div id="form-result"></div>

              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span>Sign in</span>
                  <span class="htmx-indicator">
                    <svg
                      class="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
});

// Logout action
app.post("/logout", async (c) => {
  return c.redirect("/login?message=You%20have%20been%20signed%20out");
});

export default app;

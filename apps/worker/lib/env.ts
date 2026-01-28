/**
 * Environment configuration
 * Single source of truth for all environment variables
 */

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Supabase
  supabaseUrl: getEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Internal
  internalSecret: getEnv('BUGABLE_INTERNAL_SECRET'),
  appUrl: getEnv('APP_URL', 'http://localhost:3000'),

  // Runtime detection
  isServerless: !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME,
};

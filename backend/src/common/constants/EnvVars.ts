export default {
  NodeEnv: process.env.NODE_ENV ?? 'development',
  Port: Number(process.env.PORT ?? 3000),
  Jwt: {
    Secret: process.env.JWT_SECRET ?? 'your_default_secret_key',
    Exp: Number(process.env.JWT_EXPIRATION_SECONDS ?? 60 * 60 * 24), // 1 day in seconds
  },
} as const;
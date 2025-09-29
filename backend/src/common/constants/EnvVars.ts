export default {
  NodeEnv: process.env.NODE_ENV ?? 'development',
  Port: Number(process.env.PORT ?? 3000),
  Jwt: {
    Secret: process.env.JWT_SECRET ?? 'your_default_secret_key',
    Exp: process.env.JWT_EXPIRATION ?? '1d',
  },
} as const;
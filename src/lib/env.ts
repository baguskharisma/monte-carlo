import { z } from "zod"

/**
 * Schema untuk validasi environment variables
 * 
 * Server-side variables: tidak menggunakan prefix NEXT_PUBLIC_
 * Client-side variables: menggunakan prefix NEXT_PUBLIC_
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Next.js Public Variables (exposed to client)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Server-side only variables
  // Tambahkan environment variables server-side di sini
  // Contoh:
  // DATABASE_URL: z.string().url(),
  // JWT_SECRET: z.string().min(32),
  // API_KEY: z.string(),
})

/**
 * Validasi dan parse environment variables
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => {
        const path = issue.path.join(".")
        return `  - ${path}: ${issue.message}`
      }).join("\n")

      throw new Error(
        `Invalid environment variables:\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
      )
    }
    throw error
  }
}

/**
 * Validated environment variables
 * Akses environment variables dengan type safety
 * 
 * @example
 * ```ts
 * import { env } from "@/lib/env"
 * 
 * const apiUrl = env.NEXT_PUBLIC_API_URL
 * ```
 */
export const env = validateEnv()

/**
 * Type untuk environment variables
 * Berguna untuk type checking di tempat lain
 */
export type Env = z.infer<typeof envSchema>


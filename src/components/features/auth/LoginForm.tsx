"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { AxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// ----------------------
// Validation Schema
// ----------------------
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/

const loginSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, "Format nomor Indonesia tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean()
})

type LoginFormValues = z.infer<typeof loginSchema>

// Explicitly enforce boolean (avoid optional inference)
type LoginFormSubmit = {
  phone: string
  password: string
  rememberMe: boolean
}

// ----------------------
// Props
// ----------------------
interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

// ----------------------
// Component
// ----------------------
export default function LoginForm({
  onSuccess,
  redirectTo,
}: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin, redirectToDashboard } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get return URL from query params (set by middleware)
  const returnUrl = searchParams.get('returnUrl')

  const form = useForm<LoginFormSubmit>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit: SubmitHandler<LoginFormSubmit> = async (values) => {
    try {
      setIsLoading(true)

      // Login using useAuth hook (automatically stores tokens and syncs to cookies)
      await authLogin(values.phone, values.password)

      // Call success callback if provided
      onSuccess?.()

      // Priority: returnUrl > redirectTo prop > role-based dashboard
      if (returnUrl) {
        // User was redirected from a protected route - send them back
        router.push(returnUrl)
      } else if (redirectTo) {
        // Custom redirect provided via props
        router.push(redirectTo)
      } else {
        // Default: redirect to role-appropriate dashboard
        // Super Admin/Admin → /admin/dashboard
        // Driver → /driver/dashboard
        // Customer → /customer/dashboard
        redirectToDashboard()
      }
    } catch (err) {
      console.error("Login error:", err)

      // Handle API errors
      if (err instanceof AxiosError) {
        const errorMessage = err.response?.data?.message || "Login gagal. Silakan coba lagi."
        alert(errorMessage)
      } else {
        alert("Terjadi kesalahan. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 max-w-sm mx-auto"
    >
      {/* Phone Input */}
      <div className="space-y-1">
        <Label htmlFor="phone">Nomor HP</Label>
        <Input
          id="phone"
          placeholder="08xxxxxxxxxx"
          {...form.register("phone")}
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-red-500">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me + Forgot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={form.watch("rememberMe")}
            onCheckedChange={(v) => form.setValue("rememberMe", Boolean(v))}
          />
          <Label htmlFor="rememberMe">Remember me</Label>
        </div>

        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Lupa password?
        </a>
      </div>

      {/* Login Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>
    </form>
  )
}

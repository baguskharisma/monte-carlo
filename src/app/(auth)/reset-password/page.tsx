/**
 * Reset Password Page
 * Verify OTP and set new password
 */

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get('phone') || '';

  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      if (!phoneFromQuery) {
        toast.error('Missing phone number', {
          description: 'Please start from the forgot password page',
        });
        router.push('/forgot-password');
        return;
      }

      await authService.resetPassword(phoneFromQuery, data.code, data.newPassword);

      setIsSuccess(true);

      toast.success('Password reset successful!', {
        description: 'You can now login with your new password',
      });

      // Redirect to login page after success
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast.error('Password reset failed', {
        description:
          error instanceof Error ? error.message : 'Invalid or expired OTP code',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/forgot-password"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
        <p className="text-sm text-muted-foreground">
          Enter the OTP code sent to your WhatsApp and your new password
        </p>
        {phoneFromQuery && (
          <p className="text-xs text-muted-foreground">
            Phone: <span className="font-medium">{phoneFromQuery}</span>
          </p>
        )}
      </div>

      {/* Success State */}
      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">Password reset successful!</p>
            <p className="text-sm text-muted-foreground">
              Your password has been updated.
              <br />
              Redirecting to login page...
            </p>
          </div>
        </div>
      ) : (
        /* Reset Password Form */
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* OTP Code Field */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      autoComplete="one-time-code"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the 6-digit code sent to your WhatsApp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </Form>
      )}

      {/* Help Text */}
      {!isSuccess && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Didn't receive the code?{' '}
            <Link href="/forgot-password" className="text-primary hover:underline">
              Send again
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

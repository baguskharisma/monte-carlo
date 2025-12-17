/**
 * Forgot Password Page
 * Request OTP code via WhatsApp for password reset
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/types/auth.types';
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await authService.forgotPassword(data.phone);

      setIsSuccess(true);

      toast.success('OTP sent successfully!', {
        description: `Check your WhatsApp for the verification code. Valid for ${response.expiresIn / 60} minutes.`,
      });

      // Redirect to reset password page with phone number
      setTimeout(() => {
        router.push(`/reset-password?phone=${encodeURIComponent(data.phone)}`);
      }, 2000);
    } catch (error) {
      toast.error('Failed to send OTP', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Forgot password?</h2>
        <p className="text-sm text-muted-foreground">
          Enter your phone number and we'll send you an OTP code via WhatsApp
        </p>
      </div>

      {/* Success State */}
      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">OTP sent successfully!</p>
            <p className="text-sm text-muted-foreground">
              Check your WhatsApp for the verification code.
              <br />
              Redirecting to password reset page...
            </p>
          </div>
        </div>
      ) : (
        /* Forgot Password Form */
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="08123456789"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the phone number associated with your account
                  </FormDescription>
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
                  Sending OTP...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send OTP via WhatsApp
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

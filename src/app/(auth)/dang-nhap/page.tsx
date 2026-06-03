'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        matKhau: data.matKhau,
        redirect: false,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Abstract background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Left branding panel — hidden on mobile */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-20 -right-10 h-60 w-60 rounded-full bg-violet-400/20 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-lg leading-tight">Phòng trọ</p>
            <p className="text-indigo-200 text-sm">Hệ thống quản lý</p>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" />
            Quản lý thông minh
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Quản lý phòng trọ chuyên nghiệp
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Theo dõi phòng, hợp đồng, hóa đơn và khách thuê — tất cả trong một dashboard hiện đại.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {['Quản lý phòng', 'Hóa đơn tự động', 'Báo cáo doanh thu'].map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm ring-1 ring-white/15"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-300 text-sm">
          © {new Date().getFullYear()} Phòng trọ Management System
        </p>
      </div>

      {/* Right login form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Đăng nhập</h2>
            <p className="mt-1 text-sm text-muted-foreground">Quản lý phòng trọ</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/70 p-6 md:p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:bg-card/70">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold text-foreground">Chào mừng trở lại</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nhập thông tin đăng nhập của bạn
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register('email')}
                  className={`h-11 rounded-xl bg-white/80 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                    errors.email ? 'border-rose-400 focus-visible:ring-rose-500/30' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matKhau" className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="matKhau"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('matKhau')}
                    className={`h-11 rounded-xl bg-white/80 pr-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                      errors.matKhau ? 'border-rose-400 focus-visible:ring-rose-500/30' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg hover:bg-slate-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.matKhau && (
                  <p className="text-xs text-rose-500">{errors.matKhau.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5 pt-5 border-t border-border/40">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

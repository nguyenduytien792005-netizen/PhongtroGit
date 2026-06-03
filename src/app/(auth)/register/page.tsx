'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10–11 chữ số'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
      } else {
        setError(result.message || 'Đăng ký thất bại, vui lòng thử lại');
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Abstract background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Left branding panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-violet-700 via-indigo-700 to-indigo-800 text-white overflow-hidden">
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
        <div className="absolute top-20 -right-10 h-60 w-60 rounded-full bg-indigo-400/20 blur-2xl" />

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
            <UserPlus className="h-3.5 w-3.5" />
            Dành cho đội ngũ nội bộ
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Tham gia đội quản lý
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Tạo tài khoản để quản lý phòng, hợp đồng và vận hành — sau khi được Quản trị viên phê duyệt.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {['Quản lý vận hành', 'Theo dõi hóa đơn', 'Báo cáo sự cố'].map((feature) => (
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

      {/* Right form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Đăng ký tài khoản</h2>
            <p className="mt-1 text-sm text-muted-foreground">Dành cho đội ngũ nội bộ</p>
          </div>

          {isSuccess ? (
            <div className="rounded-2xl border border-emerald-200/60 bg-white/80 p-8 shadow-xl shadow-emerald-500/5 backdrop-blur-xl text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Đăng ký thành công!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tài khoản của bạn đang chờ Quản trị viên phê duyệt.
                  Bạn sẽ nhận được thông báo khi tài khoản được kích hoạt.
                </p>
              </div>
              <Button
                asChild
                className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg"
              >
                <Link href="/dang-nhap">
                  Quay lại trang đăng nhập
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-white/70 p-6 md:p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:bg-card/70">
              <div className="hidden lg:block mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tài khoản nội bộ
                </div>
                <h2 className="text-2xl font-bold text-foreground">Tạo tài khoản mới</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Điền thông tin để đăng ký làm thành viên đội quản lý
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Họ và tên
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    {...register('name')}
                    className={`h-11 rounded-xl bg-white/80 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                      errors.name ? 'border-rose-400 focus-visible:ring-rose-500/30' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email công việc
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nhanvien@example.com"
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
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0912345678"
                      {...register('phone')}
                      className={`h-11 rounded-xl bg-white/80 pl-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                        errors.phone ? 'border-rose-400 focus-visible:ring-rose-500/30' : ''
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-rose-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={`h-11 rounded-xl bg-white/80 pr-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                        errors.password ? 'border-rose-400 focus-visible:ring-rose-500/30' : ''
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
                  {errors.password && (
                    <p className="text-xs text-rose-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={`h-11 rounded-xl bg-white/80 pr-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                        errors.confirmPassword ? 'border-rose-400 focus-visible:ring-rose-500/30' : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg hover:bg-slate-100"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng ký tài khoản'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  Đã có tài khoản?{' '}
                  <Link
                    href="/dang-nhap"
                    className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

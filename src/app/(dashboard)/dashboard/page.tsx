'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  DoorOpen, 
  Receipt, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardStats } from '@/types';
import { StatCard, safePercent } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStats(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!Number.isFinite(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (!Number.isFinite(amount)) return '0 ₫';
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)} tr`;
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const phongTrongPct = safePercent(stats.phongTrong, stats.tongSoPhong);
  const phongDangThuePct = safePercent(stats.phongDangThue, stats.tongSoPhong);
  const phongBaoTriPct = safePercent(stats.phongBaoTri, stats.tongSoPhong);

  const roomBreakdown = [
    { label: 'Phòng trống', value: stats.phongTrong, pct: phongTrongPct, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { label: 'Đang thuê', value: stats.phongDangThue, pct: phongDangThuePct, color: 'bg-sky-500', text: 'text-sky-600' },
    { label: 'Bảo trì', value: stats.phongBaoTri, pct: phongBaoTriPct, color: 'bg-amber-500', text: 'text-amber-600' },
  ];

  const activities = [
    {
      dot: 'bg-indigo-500',
      title: 'Khách thuê mới đăng ký',
      desc: 'Nguyễn Văn A — Phòng P101',
      badge: 'Mới' as const,
      variant: 'new' as const,
    },
    {
      dot: 'bg-emerald-500',
      title: 'Thanh toán thành công',
      desc: 'Phòng P102 — 2.500.000 ₫',
      badge: 'Hoàn thành',
      variant: 'success' as const,
    },
    {
      dot: 'bg-amber-500',
      title: 'Báo cáo sự cố',
      desc: 'Phòng P105 — Hỏng điều hòa',
      badge: 'Cần xử lý',
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-header-title">Dashboard</h1>
        <p className="page-header-subtitle">
          Tổng quan hệ thống quản lý phòng trọ
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Tổng phòng"
          value={stats.tongSoPhong}
          icon={Building2}
          variant="default"
          subtitle={`${stats.phongDangThue} đang thuê`}
        />
        <StatCard
          title="Phòng trống"
          value={stats.phongTrong}
          icon={DoorOpen}
          variant="success"
          subtitle={`${phongTrongPct}% tổng số phòng`}
        />
        <StatCard
          title="Doanh thu tháng"
          value={formatCompactCurrency(stats.doanhThuThang)}
          icon={TrendingUp}
          variant="info"
          subtitle={formatCurrency(stats.doanhThuThang)}
          trend={{ label: 'Tháng này', positive: true }}
        />
        <StatCard
          title="Sự cố"
          value={stats.suCoCanXuLy}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Cần xử lý ngay"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          title="Hóa đơn sắp đến hạn"
          value={stats.hoaDonSapDenHan}
          icon={Calendar}
          variant="warning"
          subtitle="Cần theo dõi"
        />
        <StatCard
          title="Hợp đồng sắp hết hạn"
          value={stats.hopDongSapHetHan}
          icon={Clock}
          variant="purple"
          subtitle="Cần gia hạn"
        />
        <StatCard
          title="Doanh thu năm"
          value={formatCompactCurrency(stats.doanhThuNam)}
          icon={Receipt}
          variant="success"
          subtitle={formatCurrency(stats.doanhThuNam)}
        />
      </div>

      {/* Activities & Room Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl border-border/60 shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg font-semibold">
                  Hoạt động gần đây
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-0.5">
                  Các hoạt động mới nhất trong hệ thống
                </CardDescription>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {activities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-muted/30"
                >
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0 ring-4 ring-offset-1', activity.dot, {
                    'ring-indigo-100': activity.variant === 'new',
                    'ring-emerald-100': activity.variant === 'success',
                    'ring-rose-100': activity.variant === 'danger',
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.desc}</p>
                  </div>
                  <StatusBadge variant={activity.variant}>{activity.badge}</StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-base md:text-lg font-semibold">
              Thống kê phòng
            </CardTitle>
            <CardDescription className="text-xs md:text-sm mt-0.5">
              Tình trạng sử dụng phòng
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {roomBreakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-bold tabular-nums', item.text)}>
                      {item.value}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({item.pct}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', item.color)}
                    style={{ width: `${Math.min(parseFloat(item.pct), 100)}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-border/40">
              <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 px-4 py-3">
                <span className="text-sm font-semibold text-indigo-900">Tổng cộng</span>
                <span className="text-lg font-bold text-indigo-700 tabular-nums">
                  {stats.tongSoPhong} phòng
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

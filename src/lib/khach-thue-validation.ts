import { z } from 'zod';

const PHONE_REGEX = /^[0-9]{10,11}$/;

/** Chuẩn hóa SĐT: chuỗi rỗng → undefined (không lưu / không kiểm tra trùng). */
export function normalizeSoDienThoai(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const optionalSoDienThoaiSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((val) => normalizeSoDienThoai(val ?? undefined))
  .refine((val) => val === undefined || PHONE_REGEX.test(val), {
    message: 'Số điện thoại không hợp lệ',
  });

export const thuePhongSchema = z.object({
  phongId: z.string().min(1, 'Phòng là bắt buộc'),
  ngayBatDau: z.string().optional(),
  ngayKetThuc: z.string().optional(),
  trangThaiCuTru: z.enum(['dangO', 'daTraPhong', 'boCoc']).optional(),
  hopDongId: z.string().optional(),
});

export const khachThueSchema = z.object({
  hoTen: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  soDienThoai: optionalSoDienThoaiSchema,
  email: z.string().email('Email không hợp lệ').optional(),
  cccd: z.string().regex(/^[0-9]{12}$/, 'CCCD phải có 12 chữ số'),
  ngaySinh: z.string().min(1, 'Ngày sinh là bắt buộc'),
  gioiTinh: z.enum(['nam', 'nu', 'khac']),
  queQuan: z.string().min(1, 'Quê quán là bắt buộc'),
  anhCCCD: z
    .object({
      matTruoc: z.string().optional(),
      matSau: z.string().optional(),
    })
    .optional(),
  ngheNghiep: z.string().optional(),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  thuePhong: thuePhongSchema.optional(),
});

export type KhachThueInput = z.infer<typeof khachThueSchema>;

/** Điều kiện trùng SĐT — chỉ khi có số điện thoại. */
export function buildDuplicateOrConditions(
  cccd: string,
  soDienThoai?: string
): Array<{ cccd: string } | { soDienThoai: string }> {
  const conditions: Array<{ cccd: string } | { soDienThoai: string }> = [{ cccd }];
  if (soDienThoai) {
    conditions.push({ soDienThoai });
  }
  return conditions;
}

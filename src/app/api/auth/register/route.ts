import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NguoiDung from '@/models/NguoiDung';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = registerSchema.parse(body);

    await dbConnect();

    const existingUser = await NguoiDung.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email này đã được sử dụng!' },
        { status: 400 }
      );
    }

    const newUser = new NguoiDung({
      ten: name,
      email: email.toLowerCase(),
      matKhau: password,
      soDienThoai: phone,
      vaiTro: 'nhanVien',
      trangThai: 'khoa',
      name,
      password,
      phone,
      role: 'nhanVien',
      isActive: false,
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng đợi Quản trị viên kích hoạt tài khoản.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Lỗi server, vui lòng thử lại' },
      { status: 500 }
    );
  }
}

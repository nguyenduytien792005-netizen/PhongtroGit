import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NguoiDung from '@/models/NguoiDung';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Xóa sạch dữ liệu cũ trong collection NguoiDung trước
    await NguoiDung.deleteMany({});

    // 2. Tạo tài khoản tài khoản ADMIN
    const admin = new NguoiDung({
      // Tiếng Việt
      ten: 'Admin',
      email: 'admin@example.com',
      matKhau: '123456',
      soDienThoai: '0326132124',
      vaiTro: 'admin',
      trangThai: 'hoatDong',
      // Tiếng Anh (Bắt buộc tương thích)
      name: 'Admin',
      password: '123456',
      phone: '0326132124',
      role: 'admin',
      isActive: true,
    });
    await admin.save();

    // 3. Tạo tài khoản KHÁCH THUỀ (User thường)
    const userThuong = new NguoiDung({
      // Tiếng Việt
      ten: 'Khách hàng A',
      email: 'khach@example.com',
      matKhau: '123456',
      soDienThoai: '0987654321',
      vaiTro: 'user',
      trangThai: 'hoatDong',
      // Tiếng Anh (Bắt buộc tương thích)
      name: 'Khách hàng A',
      password: '123456',
      phone: '0987654321',
      role: 'user',
      isActive: true,
    });
    await userThuong.save();

    // 4. Trả về kết quả thành công ra màn hình trình duyệt
    return NextResponse.json({
      success: true,
      message: 'Seed data đã được tạo thành công',
      data: {
        admin: admin.email,
        user: userThuong.email
      }
    });

  } catch (error: any) {
    console.error('Error seeding data:', error);
    // Trả hẳn thông báo lỗi chi tiết ra để nếu lỗi còn biết đường sửa
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

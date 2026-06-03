import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import KhachThue from '@/models/KhachThue';
import HopDong from '@/models/HopDong';
import { syncThuePhong } from '@/lib/thue-phong-service';
import {
  khachThueSchema,
  buildDuplicateOrConditions,
} from '@/lib/khach-thue-validation';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const khachThue = await KhachThue.findById(id);

    if (!khachThue) {
      return NextResponse.json(
        { message: 'Khách thuê không tồn tại' },
        { status: 404 }
      );
    }

    const hopDong = await HopDong.findOne({
      $or: [{ khachThueId: id }, { nguoiDaiDien: id }],
      trangThai: 'hoatDong',
      ngayBatDau: { $lte: new Date() },
      ngayKetThuc: { $gte: new Date() },
    })
      .populate('phong', 'maPhong toaNha')
      .populate({
        path: 'phong',
        populate: { path: 'toaNha', select: 'tenToaNha' },
      });

    return NextResponse.json({
      success: true,
      data: {
        ...khachThue.toObject(),
        hopDongHienTai: hopDong,
      },
    });

  } catch (error) {
    console.error('Error fetching khach thue:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { thuePhong, ...khachFields } = khachThueSchema.parse(body);

    await dbConnect();
    const { id } = await params;

    const existingKhachThue = await KhachThue.findOne({
      _id: { $ne: id },
      $or: buildDuplicateOrConditions(khachFields.cccd, khachFields.soDienThoai),
    });

    if (existingKhachThue) {
      const message =
        khachFields.soDienThoai &&
        existingKhachThue.soDienThoai === khachFields.soDienThoai
          ? 'Số điện thoại đã được sử dụng'
          : 'CCCD đã được sử dụng';
      return NextResponse.json({ message }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      ...khachFields,
      ngaySinh: new Date(khachFields.ngaySinh),
      anhCCCD: khachFields.anhCCCD || { matTruoc: '', matSau: '' },
    };
    if (!khachFields.soDienThoai) {
      delete updateData.soDienThoai;
    }

    // Nếu có mật khẩu mới, cập nhật
    // Mật khẩu sẽ tự động hash qua pre-save middleware
    if (khachFields.matKhau) {
      const khachThue = await KhachThue.findById(id);
      if (!khachThue) {
        return NextResponse.json(
          { message: 'Khách thuê không tồn tại' },
          { status: 404 }
        );
      }
      
      Object.assign(khachThue, updateData);
      if (!khachFields.soDienThoai) {
        khachThue.soDienThoai = undefined;
      }
      khachThue.matKhau = khachFields.matKhau;
      await khachThue.save();

      if (thuePhong?.phongId) {
        await syncThuePhong({
          phongId: thuePhong.phongId,
          khachThueId: id,
          ngayBatDau: thuePhong.ngayBatDau,
          ngayKetThuc: thuePhong.ngayKetThuc,
          trangThaiCuTru: thuePhong.trangThaiCuTru,
          hopDongId: thuePhong.hopDongId,
        });
      }
      
      return NextResponse.json({
        success: true,
        data: khachThue,
        message: 'Khách thuê đã được cập nhật thành công',
      });
    }

    delete updateData.matKhau;
    const updateQuery = !khachFields.soDienThoai
      ? { $set: updateData, $unset: { soDienThoai: 1 } }
      : updateData;
    const khachThue = await KhachThue.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!khachThue) {
      return NextResponse.json(
        { message: 'Khách thuê không tồn tại' },
        { status: 404 }
      );
    }

    if (thuePhong?.phongId) {
      await syncThuePhong({
        phongId: thuePhong.phongId,
        khachThueId: id,
        ngayBatDau: thuePhong.ngayBatDau,
        ngayKetThuc: thuePhong.ngayKetThuc,
        trangThaiCuTru: thuePhong.trangThaiCuTru,
        hopDongId: thuePhong.hopDongId,
      });
    }

    return NextResponse.json({
      success: true,
      data: khachThue,
      message: 'Khách thuê đã được cập nhật thành công',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error('Error updating khach thue:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const khachThue = await KhachThue.findById(id);
    if (!khachThue) {
      return NextResponse.json(
        { message: 'Khách thuê không tồn tại' },
        { status: 404 }
      );
    }

    await KhachThue.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Khách thuê đã được xóa thành công',
    });

  } catch (error) {
    console.error('Error deleting khach thue:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

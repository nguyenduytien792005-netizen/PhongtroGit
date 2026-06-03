import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import KhachThue from '@/models/KhachThue';
import HopDong from '@/models/HopDong';
import Phong from '@/models/Phong';
import { updateKhachThueStatus } from '@/lib/status-utils';
import { syncThuePhong } from '@/lib/thue-phong-service';
import {
  khachThueSchema,
  buildDuplicateOrConditions,
} from '@/lib/khach-thue-validation';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const trangThai = searchParams.get('trangThai') || '';

    const query: any = {};
    
    if (search) {
      query.$or = [
        { hoTen: { $regex: search, $options: 'i' } },
        { soDienThoai: { $regex: search, $options: 'i' } },
        { cccd: { $regex: search, $options: 'i' } },
        { queQuan: { $regex: search, $options: 'i' } },
        { ngheNghiep: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (trangThai) {
      query.trangThai = trangThai;
    }

    const khachThueList = await KhachThue.find(query)
      .select('+matKhau') // Include password field to check if exists
      .sort({ hoTen: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Cập nhật trạng thái khách thuê dựa trên hợp đồng
    await Promise.all(
      khachThueList.map(khach => updateKhachThueStatus(khach._id.toString()))
    );

    // Lấy lại dữ liệu với trạng thái đã cập nhật
    const updatedKhachThueList = await KhachThue.find(query)
      .select('+matKhau') // Include password field to check if exists
      .sort({ hoTen: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Thêm thông tin hợp đồng và phòng cho mỗi khách thuê
    const khachThueListWithContracts = await Promise.all(
      updatedKhachThueList.map(async (khachThue) => {
        const hopDong = await HopDong.findOne({
          $or: [{ khachThueId: khachThue._id }, { nguoiDaiDien: khachThue._id }],
          trangThai: 'hoatDong',
          ngayBatDau: { $lte: new Date() },
          ngayKetThuc: { $gte: new Date() },
        })
        .populate('phong', 'maPhong toaNha')
        .populate({
          path: 'phong',
          populate: {
            path: 'toaNha',
            select: 'tenToaNha'
          }
        });
        
        const khachThueObj = khachThue.toObject();
        // Chuyển matKhau thành boolean để frontend biết đã có mật khẩu hay chưa
        // Không trả về giá trị thực của mật khẩu (đã hash)
        return {
          ...khachThueObj,
          matKhau: !!khachThueObj.matKhau ? '******' : undefined,
          hopDongHienTai: hopDong
        };
      })
    );

    const total = await KhachThue.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: khachThueListWithContracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

export async function POST(request: NextRequest) {
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

    const existingKhachThue = await KhachThue.findOne({
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

    const createPayload: Record<string, unknown> = {
      ...khachFields,
      ngaySinh: new Date(khachFields.ngaySinh),
      anhCCCD: khachFields.anhCCCD || { matTruoc: '', matSau: '' },
      trangThai: 'chuaThue',
    };
    if (!khachFields.soDienThoai) {
      delete createPayload.soDienThoai;
    }

    const newKhachThue = new KhachThue(createPayload);

    await newKhachThue.save();

    if (thuePhong?.phongId) {
      await syncThuePhong({
        phongId: thuePhong.phongId,
        khachThueId: newKhachThue._id.toString(),
        ngayBatDau: thuePhong.ngayBatDau,
        ngayKetThuc: thuePhong.ngayKetThuc,
        trangThaiCuTru: thuePhong.trangThaiCuTru,
      });
    } else {
      await updateKhachThueStatus(newKhachThue._id.toString());
    }

    return NextResponse.json({
      success: true,
      data: newKhachThue,
      message: 'Khách thuê đã được tạo thành công',
    }, { status: 201 });

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

    console.error('Error creating khach thue:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

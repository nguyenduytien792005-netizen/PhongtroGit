import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Phong from '@/models/Phong';
import ToaNha from '@/models/ToaNha';
import { updatePhongStatus } from '@/lib/status-utils';
import { syncThuePhong, endThuePhong } from '@/lib/thue-phong-service';
import { z } from 'zod';

const thuePhongSchema = z.object({
  coNguoiThue: z.boolean(),
  khachThueId: z.string().optional(),
  ngayBatDau: z.string().optional(),
  ngayKetThuc: z.string().optional(),
  trangThaiCuTru: z.enum(['dangO', 'daTraPhong', 'boCoc']).optional(),
  hopDongId: z.string().optional(),
});

const phongSchema = z.object({
  maPhong: z.string().min(1, 'Mã phòng là bắt buộc'),
  toaNha: z.string().min(1, 'Tòa nhà là bắt buộc'),
  tang: z.number().min(0, 'Tầng phải lớn hơn hoặc bằng 0'),
  dienTich: z.number().min(1, 'Diện tích phải lớn hơn 0'),
  giaThue: z.number().min(0, 'Giá thuê phải lớn hơn hoặc bằng 0'),
  tienCoc: z.number().min(0, 'Tiền cọc phải lớn hơn hoặc bằng 0'),
  moTa: z.string().optional(),
  anhPhong: z.array(z.string()).optional(),
  tienNghi: z.array(z.string()).optional(),
  soNguoiToiDa: z.number().min(1, 'Số người tối đa phải lớn hơn 0').max(10, 'Số người tối đa không được quá 10'),
  trangThai: z.enum(['trong', 'daDat', 'dangThue', 'baoTri']).optional(),
  thuePhong: thuePhongSchema.optional(),
});

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

    // Cập nhật trạng thái phòng trước khi trả về
    await updatePhongStatus(id);

    const phong = await Phong.findById(id)
      .populate('toaNha', 'tenToaNha diaChi');

    if (!phong) {
      return NextResponse.json(
        { message: 'Phòng không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: phong,
    });

  } catch (error) {
    console.error('Error fetching phong:', error);
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
    const { thuePhong, trangThai, ...phongFields } = phongSchema.parse(body);

    await dbConnect();
    const { id } = await params;

    // Check if toa nha exists
    const toaNha = await ToaNha.findById(phongFields.toaNha);
    if (!toaNha) {
      return NextResponse.json(
        { message: 'Tòa nhà không tồn tại' },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      ...phongFields,
      anhPhong: phongFields.anhPhong || [],
      tienNghi: phongFields.tienNghi || [],
    };
    if (trangThai === 'baoTri') {
      updatePayload.trangThai = 'baoTri';
    }

    const phong = await Phong.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    ).populate('toaNha', 'tenToaNha diaChi');

    if (!phong) {
      return NextResponse.json(
        { message: 'Phòng không tồn tại' },
        { status: 404 }
      );
    }

    if (thuePhong) {
      if (thuePhong.coNguoiThue && thuePhong.khachThueId) {
        await syncThuePhong({
          phongId: id,
          khachThueId: thuePhong.khachThueId,
          ngayBatDau: thuePhong.ngayBatDau,
          ngayKetThuc: thuePhong.ngayKetThuc,
          trangThaiCuTru: thuePhong.trangThaiCuTru,
          giaThue: phongFields.giaThue,
          tienCoc: phongFields.tienCoc,
          hopDongId: thuePhong.hopDongId,
        });
      } else if (!thuePhong.coNguoiThue) {
        await endThuePhong(id);
      }
    } else if (trangThai !== 'baoTri') {
      await updatePhongStatus(id);
    }

    // Lấy lại dữ liệu với trạng thái đã cập nhật
    const updatedPhong = await Phong.findById(id)
      .populate('toaNha', 'tenToaNha diaChi');

    return NextResponse.json({
      success: true,
      data: updatedPhong,
      message: 'Phòng đã được cập nhật thành công',
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

    console.error('Error updating phong:', error);
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

    const phong = await Phong.findById(id);
    if (!phong) {
      return NextResponse.json(
        { message: 'Phòng không tồn tại' },
        { status: 404 }
      );
    }

    await Phong.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Phòng đã được xóa thành công',
    });

  } catch (error) {
    console.error('Error deleting phong:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

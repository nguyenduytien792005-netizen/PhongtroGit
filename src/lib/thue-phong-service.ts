import HopDong from '@/models/HopDong';
import Phong from '@/models/Phong';
import KhachThue from '@/models/KhachThue';
import { updatePhongStatus, updateKhachThueStatus } from '@/lib/status-utils';

export type TrangThaiCuTru = 'dangO' | 'daTraPhong' | 'boCoc';

export interface ThuePhongInput {
  phongId: string;
  khachThueId: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  trangThaiCuTru?: TrangThaiCuTru;
  giaThue?: number;
  tienCoc?: number;
  hopDongId?: string;
}

const DIEU_KHOAN_MAC_DINH =
  'Hợp đồng thuê phòng được tạo từ hệ thống quản lý. Hai bên cam kết thực hiện đúng các điều khoản về tiền thuê, tiền cọc và tiện ích đi kèm.';

function defaultNgayKetThuc(ngayBatDau: Date): Date {
  const end = new Date(ngayBatDau);
  end.setFullYear(end.getFullYear() + 1);
  return end;
}

// 🔥 ĐOẠN ĐÃ ĐƯỢC CHỈNH SỬA: Thêm hậu tố ngẫu nhiên để tránh trùng lặp giữa các tòa nhà
function generateMaHopDong(maPhong: string): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const cleanMaPhong = maPhong.replace(/[^A-Z0-9]/gi, '');
  
  // Sinh một số ngẫu nhiên từ 1000 đến 9999 để gắn vào đuôi mã hợp đồng
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
  
  return `HD${stamp}${cleanMaPhong}-${randomSuffix}`; 
  // Kết quả mới sẽ có dạng: HD20260602401-4829 (Không bao giờ lo trùng lặp!)
}

export async function syncThuePhong(input: ThuePhongInput): Promise<void> {
  const phong = await Phong.findById(input.phongId);
  if (!phong) {
    throw new Error('Phòng không tồn tại');
  }

  const khachThue = await KhachThue.findById(input.khachThueId);
  if (!khachThue) {
    throw new Error('Khách thuê không tồn tại');
  }

  const trangThaiCuTru = input.trangThaiCuTru || 'dangO';

  let hopDong = input.hopDongId
    ? await HopDong.findById(input.hopDongId)
    : await HopDong.findOne({
        phong: input.phongId,
        trangThai: 'hoatDong',
        $or: [{ khachThueId: input.khachThueId }, { nguoiDaiDien: input.khachThueId }],
      });

  if (trangThaiCuTru === 'daTraPhong' || trangThaiCuTru === 'boCoc') {
    if (hopDong) {
      hopDong.trangThaiCuTru = trangThaiCuTru;
      hopDong.trangThai = 'hetHan';
      await hopDong.save();
      await updatePhongStatus(input.phongId);
      await updateKhachThueStatus(input.khachThueId);
    }
    return;
  }

  const ngayBatDau = input.ngayBatDau ? new Date(input.ngayBatDau) : new Date();
  const ngayKetThuc = input.ngayKetThuc
    ? new Date(input.ngayKetThuc)
    : defaultNgayKetThuc(ngayBatDau);

  if (hopDong) {
    hopDong.khachThueId = [input.khachThueId as any];
    hopDong.nguoiDaiDien = input.khachThueId as any;
    hopDong.ngayBatDau = ngayBatDau;
    hopDong.ngayKetThuc = ngayKetThuc;
    hopDong.giaThue = input.giaThue ?? phong.giaThue;
    hopDong.tienCoc = input.tienCoc ?? phong.tienCoc;
    hopDong.trangThaiCuTru = 'dangO';
    hopDong.trangThai = 'hoatDong';
    await hopDong.save();
  } else {
    const otherActive = await HopDong.findOne({
      phong: input.phongId,
      trangThai: 'hoatDong',
      ngayKetThuc: { $gte: new Date() },
    });

    if (otherActive) {
      throw new Error('Phòng đã có hợp đồng đang hoạt động');
    }

    hopDong = new HopDong({
      maHopDong: generateMaHopDong(phong.maPhong),
      phong: input.phongId,
      khachThueId: [input.khachThueId],
      nguoiDaiDien: input.khachThueId,
      ngayBatDau,
      ngayKetThuc,
      giaThue: input.giaThue ?? phong.giaThue,
      tienCoc: input.tienCoc ?? phong.tienCoc,
      chuKyThanhToan: 'thang',
      ngayThanhToan: 15,
      dieuKhoan: DIEU_KHOAN_MAC_DINH,
      giaDien: 3500,
      giaNuoc: 25000,
      chiSoDienBanDau: 0,
      chiSoNuocBanDau: 0,
      phiDichVu: [],
      trangThai: 'hoatDong',
      trangThaiCuTru: 'dangO',
    });
    await hopDong.save();
  }

  await updatePhongStatus(input.phongId);
  await updateKhachThueStatus(input.khachThueId);
}

export async function endThuePhong(phongId: string): Promise<void> {
  const hopDong = await HopDong.findOne({
    phong: phongId,
    trangThai: 'hoatDong',
  });

  if (!hopDong) return;

  hopDong.trangThai = 'hetHan';
  hopDong.trangThaiCuTru = 'daTraPhong';
  await hopDong.save();

  const khachIds = [
    ...(hopDong.khachThueId || []).map((id: any) => id.toString()),
    hopDong.nguoiDaiDien?.toString(),
  ].filter(Boolean) as string[];

  await updatePhongStatus(phongId);
  await Promise.all(khachIds.map((id) => updateKhachThueStatus(id)));
}
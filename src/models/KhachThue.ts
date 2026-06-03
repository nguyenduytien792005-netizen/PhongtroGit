import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IKhachThue extends Document {
  hoTen: string;
  soDienThoai?: string;
  email?: string;
  cccd: string;
  ngaySinh: Date;
  gioiTinh: 'nam' | 'nu' | 'khac';
  queQuan: string;
  anhCCCD?: {
    matTruoc: string;
    matSau: string;
  };
  ngheNghiep?: string;
  matKhau?: string;
  trangThai: 'dangThue' | 'daTraPhong' | 'chuaThue';
  ngayTao: Date;
  ngayCapNhat: Date;
}

const AnhCCCDSchema = new Schema({
  matTruoc: {
    type: String,
    trim: true,
    default: ''
  },
  matSau: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const KhachThueSchema = new Schema<IKhachThue>({
  hoTen: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ tên không được quá 100 ký tự']
  },
  soDienThoai: {
    type: String,
    required: false,
    set(value: string | null | undefined) {
      if (value == null || String(value).trim() === '') return undefined;
      return String(value).trim();
    },
    validate: {
      validator(value: string | null | undefined) {
        if (value == null || value === '') return true;
        return /^[0-9]{10,11}$/.test(value);
      },
      message: 'Số điện thoại không hợp lệ',
    },
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  cccd: {
    type: String,
    required: [true, 'CCCD là bắt buộc'],
    unique: true,
    match: [/^[0-9]{12}$/, 'CCCD phải có 12 chữ số']
  },
  ngaySinh: {
    type: Date,
    required: [true, 'Ngày sinh là bắt buộc']
  },
  gioiTinh: {
    type: String,
    enum: ['nam', 'nu', 'khac'],
    required: [true, 'Giới tính là bắt buộc']
  },
  queQuan: {
    type: String,
    required: [true, 'Quê quán là bắt buộc'],
    trim: true,
    maxlength: [200, 'Quê quán không được quá 200 ký tự']
  },
  anhCCCD: {
    type: AnhCCCDSchema,
    default: { matTruoc: '', matSau: '' }
  },
  ngheNghiep: {
    type: String,
    trim: true,
    maxlength: [100, 'Nghề nghiệp không được quá 100 ký tự']
  },
  matKhau: {
    type: String,
    select: false, // Không trả về mật khẩu khi query
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  trangThai: {
    type: String,
    enum: ['dangThue', 'daTraPhong', 'chuaThue'],
    default: 'chuaThue'
  }
}, {
  timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' }
});

// Chuẩn hóa SĐT rỗng → không lưu (tránh lỗi validate / index trùng)
KhachThueSchema.pre('save', function(next) {
  if (this.soDienThoai != null && String(this.soDienThoai).trim() === '') {
    this.soDienThoai = undefined;
  }
  next();
});

// Middleware để hash mật khẩu trước khi lưu
KhachThueSchema.pre('save', async function(next) {
  // Chỉ hash mật khẩu nếu nó được modified (hoặc new)
  if (!this.isModified('matKhau') || !this.matKhau) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.matKhau = await bcrypt.hash(this.matKhau, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method để so sánh mật khẩu
KhachThueSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.matKhau) return false;
    return await bcrypt.compare(candidatePassword, this.matKhau);
  } catch (error) {
    return false;
  }
};

// Index cho tìm kiếm
KhachThueSchema.index({ hoTen: 'text', queQuan: 'text', ngheNghiep: 'text' });
KhachThueSchema.index({ trangThai: 1 });
// Lưu ý: nếu DB còn index unique cũ trên soDienThoai, chạy: db.khachthues.dropIndex("soDienThoai_1")

const MODEL_NAME = 'KhachThue';

// Next.js hot-reload giữ model cũ trong memory → schema required cũ vẫn chạy
if (process.env.NODE_ENV !== 'production' && mongoose.models[MODEL_NAME]) {
  delete mongoose.models[MODEL_NAME];
}

export default mongoose.models[MODEL_NAME] || mongoose.model<IKhachThue>(MODEL_NAME, KhachThueSchema);

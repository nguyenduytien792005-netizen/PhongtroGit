'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCache } from '@/hooks/use-cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Home, 
  MapPin,
  Users,
  Eye,
  ExternalLink,
  Copy,
  Info,
  Image,
  RefreshCw
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Phong, ToaNha, KhachThue } from '@/types';
import { PhongDataTable } from './table';
import { PhongImageUpload } from '@/components/ui/phong-image-upload';
import { DeleteConfirmPopover } from '@/components/ui/delete-confirm-popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader, primaryButtonClass, outlineButtonClass, premiumCardClass } from '@/components/ui/page-header';
import { AmenityTile, FormSection } from '@/components/ui/amenity-tile';

export default function PhongPage() {
  const cache = useCache<{
    phongList: Phong[];
    toaNhaList: ToaNha[];
  }>({ key: 'phong-data', duration: 300000 }); // 5 phút
  
  const [phongList, setPhongList] = useState<Phong[]>([]);
  const [toaNhaList, setToaNhaList] = useState<ToaNha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToaNha, setSelectedToaNha] = useState('');
  const [selectedTrangThai, setSelectedTrangThai] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhong, setEditingPhong] = useState<Phong | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [viewingPhongName, setViewingPhongName] = useState('');
  const [isTenantsViewerOpen, setIsTenantsViewerOpen] = useState(false);
  const [viewingTenants, setViewingTenants] = useState<any[]>([]);
  const [viewingTenantsPhongName, setViewingTenantsPhongName] = useState('');

  useEffect(() => {
    document.title = 'Quản lý Phòng';
  }, []);

  useEffect(() => {
    fetchPhong();
    fetchToaNha();
  }, []);

  const fetchPhong = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Thử load từ cache trước (nếu không force refresh)
      if (!forceRefresh) {
        const cachedData = cache.getCache();
        if (cachedData) {
          setPhongList(cachedData.phongList || []);
          setToaNhaList(cachedData.toaNhaList || []);
          setLoading(false);
          return;
        }
      }
      
      const params = new URLSearchParams();
      if (selectedToaNha && selectedToaNha !== 'all') params.append('toaNha', selectedToaNha);
      if (selectedTrangThai && selectedTrangThai !== 'all') params.append('trangThai', selectedTrangThai);
      
      // Fetch phong
      const response = await fetch(`/api/phong?${params.toString()}&limit=100`);
      let phongData: Phong[] = [];
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          phongData = result.data;
          setPhongList(phongData);
        }
      }
      
      // Fetch toa nha
      const toaNhaResponse = await fetch('/api/toa-nha');
      let toaNhaData: ToaNha[] = [];
      if (toaNhaResponse.ok) {
        const toaNhaResult = await toaNhaResponse.json();
        if (toaNhaResult.success) {
          toaNhaData = toaNhaResult.data;
          setToaNhaList(toaNhaData);
        }
      }
      
      // Lưu cache với data mới
      if (phongData.length > 0 || toaNhaData.length > 0) {
        cache.setCache({
          phongList: phongData,
          toaNhaList: toaNhaData,
        });
      }
    } catch (error) {
      console.error('Error fetching phong:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchToaNha = async () => {
    try {
      const response = await fetch('/api/toa-nha');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setToaNhaList(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching toa nha:', error);
    }
  };

  const handleRefresh = async () => {
    cache.setIsRefreshing(true);
    await fetchPhong(true); // Force refresh
    cache.setIsRefreshing(false);
    toast.success('Đã tải dữ liệu mới nhất');
  };

  useEffect(() => {
    // Khi filter thay đổi, cần force refresh để lấy data mới theo filter
    if (selectedToaNha || selectedTrangThai) {
      fetchPhong(true);
    }
  }, [selectedToaNha, selectedTrangThai]);

  const filteredPhong = phongList.filter(phong =>
    phong.maPhong.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phong.moTa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (phong: Phong) => {
    setEditingPhong(phong);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/phong/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          cache.clearCache();
          setPhongList(prev => prev.filter(phong => phong._id !== id));
          toast.success('Xóa phòng thành công!');
        } else {
          toast.error(result.message || 'Có lỗi xảy ra khi xóa phòng');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra khi xóa phòng');
      }
    } catch (error) {
      console.error('Error deleting phong:', error);
      toast.error('Có lỗi xảy ra khi xóa phòng');
    }
  };

  const handleViewImages = (phong: Phong) => {
    if (phong.anhPhong && phong.anhPhong.length > 0) {
      setViewingImages(phong.anhPhong);
      setViewingPhongName(phong.maPhong);
      setIsImageViewerOpen(true);
    } else {
      toast.info('Phòng này chưa có ảnh nào');
    }
  };

  const handleViewTenants = (phong: Phong) => {
    const phongData = phong as any;
    const hopDong = phongData.hopDongHienTai;
    
    if (hopDong && hopDong.khachThueId && hopDong.khachThueId.length > 0) {
      setViewingTenants(hopDong.khachThueId);
      setViewingTenantsPhongName(phong.maPhong);
      setIsTenantsViewerOpen(true);
    } else {
      toast.info('Phòng này chưa có người thuê');
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Quản lý phòng"
        subtitle="Danh sách tất cả phòng trong hệ thống"
        actions={
          <>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={cache.isRefreshing} className={outlineButtonClass}>
            <RefreshCw className={`h-4 w-4 mr-2 ${cache.isRefreshing ? 'animate-spin' : ''}`} />
            {cache.isRefreshing ? 'Đang tải...' : 'Tải mới'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingPhong(null)} className={`w-full sm:w-auto ${primaryButtonClass}`}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm phòng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full rounded-2xl border-border/60 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  {editingPhong ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  {editingPhong ? 'Cập nhật thông tin phòng' : 'Nhập thông tin phòng mới'}
                </DialogDescription>
              </DialogHeader>
              
              <PhongForm 
                phong={editingPhong}
                toaNhaList={toaNhaList}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                  cache.clearCache();
                  setIsDialogOpen(false);
                  fetchPhong(true);
                  toast.success(editingPhong ? 'Cập nhật phòng thành công!' : 'Thêm phòng thành công!');
                }}
              />
            </DialogContent>
          </Dialog>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <StatCard
          title="Tổng số phòng"
          value={phongList.length}
          icon={Home}
          variant="default"
        />
        <StatCard
          title="Phòng trống"
          value={phongList.filter(p => p.trangThai === 'trong').length}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Đang thuê"
          value={phongList.filter(p => p.trangThai === 'dangThue').length}
          icon={Users}
          variant="info"
        />
        <StatCard
          title="Bảo trì"
          value={phongList.filter(p => p.trangThai === 'baoTri').length}
          icon={Users}
          variant="danger"
        />
      </div>

      {/* Desktop Table View */}
      <Card className={`hidden md:block ${premiumCardClass}`}>
        <CardHeader>
          <CardTitle>Danh sách phòng</CardTitle>
          <CardDescription>
            {filteredPhong.length} phòng được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <PhongDataTable 
            data={filteredPhong}
            toaNhaList={toaNhaList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewImages={handleViewImages}
            onViewTenants={handleViewTenants}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedToaNha={selectedToaNha}
            onToaNhaChange={setSelectedToaNha}
            selectedTrangThai={selectedTrangThai}
            onTrangThaiChange={setSelectedTrangThai}
            allToaNhaList={toaNhaList}
          />
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">Danh sách phòng</h2>
          <span className="text-xs text-gray-600">{filteredPhong.length} phòng</span>
        </div>

        {/* Mobile Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedToaNha} onValueChange={setSelectedToaNha}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Tòa nhà" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tất cả tòa nhà</SelectItem>
                {toaNhaList.map((toaNha) => (
                  <SelectItem key={toaNha._id} value={toaNha._id!} className="text-sm">
                    {toaNha.tenToaNha}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTrangThai} onValueChange={setSelectedTrangThai}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tất cả</SelectItem>
                <SelectItem value="trong" className="text-sm">Trống</SelectItem>
                <SelectItem value="daDat" className="text-sm">Đã đặt</SelectItem>
                <SelectItem value="dangThue" className="text-sm">Đang thuê</SelectItem>
                <SelectItem value="baoTri" className="text-sm">Bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredPhong.length === 0 ? (
          <Card className="p-6 text-center">
            <Home className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">Không tìm thấy phòng nào</h3>
            <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredPhong.map((phong) => {
              const getTrangThaiColor = (trangThai: string) => {
                switch (trangThai) {
                  case 'trong': return 'bg-green-100 text-green-800';
                  case 'daDat': return 'bg-yellow-100 text-yellow-800';
                  case 'dangThue': return 'bg-blue-100 text-blue-800';
                  case 'baoTri': return 'bg-red-100 text-red-800';
                  default: return 'bg-gray-100 text-gray-800';
                }
              };

              const getTrangThaiText = (trangThai: string) => {
                switch (trangThai) {
                  case 'trong': return 'Trống';
                  case 'daDat': return 'Đã đặt';
                  case 'dangThue': return 'Đang thuê';
                  case 'baoTri': return 'Bảo trì';
                  default: return trangThai;
                }
              };

              return (
                <Card key={phong._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{phong.maPhong}</h3>
                        <p className="text-xs text-gray-600">Tầng {phong.tang} • {phong.dienTich}m²</p>
                      </div>
                      <Badge className={`${getTrangThaiColor(phong.trangThai)} text-xs`}>
                        {getTrangThaiText(phong.trangThai)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giá thuê:</span>
                        <span className="font-semibold text-green-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(phong.giaThue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tiền cọc:</span>
                        <span className="font-medium text-orange-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(phong.tienCoc)}
                        </span>
                      </div>
                    </div>

                    {/* Thông tin người thuê */}
                    {(() => {
                      const phongData = phong as any;
                      const hopDong = phongData.hopDongHienTai;
                      
                      if (hopDong && hopDong.khachThueId && hopDong.khachThueId.length > 0) {
                        const nguoiDaiDien = hopDong.nguoiDaiDien;
                        const soLuongKhachThue = hopDong.khachThueId.length;
                        
                        return (
                          <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Users className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-xs font-medium text-blue-900">Người thuê</span>
                            </div>
                            <div className="text-sm text-gray-900 font-medium">
                              {nguoiDaiDien?.hoTen || 'N/A'}
                            </div>
                            {nguoiDaiDien?.soDienThoai && (
                              <div className="text-xs text-gray-600">
                                {nguoiDaiDien.soDienThoai}
                              </div>
                            )}
                            {soLuongKhachThue > 1 && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0 mt-0.5"
                                onClick={() => handleViewTenants(phong)}
                              >
                                +{soLuongKhachThue - 1} người khác
                              </Button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {phong.anhPhong && phong.anhPhong.length > 0 && (
                      <div className="mb-3">
                        <img 
                          src={phong.anhPhong[0]} 
                          alt={phong.maPhong}
                          className="w-full h-32 object-cover rounded-md"
                          onClick={() => handleViewImages(phong)}
                        />
                        {phong.anhPhong.length > 1 && (
                          <div className="text-xs text-gray-600 mt-1">
                            +{phong.anhPhong.length - 1} ảnh khác
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {phong.anhPhong && phong.anhPhong.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImages(phong)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Xem ảnh phòng"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const publicUrl = `${window.location.origin}/xem-phong`;
                            navigator.clipboard.writeText(publicUrl);
                            toast.success('Đã sao chép link trang xem phòng');
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Copy link trang xem phòng"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(phong)}
                          className="flex-1 text-xs"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <DeleteConfirmPopover
                          onConfirm={() => handleDelete(phong._id!)}
                          title="Xóa phòng"
                          description="Bạn có chắc chắn muốn xóa phòng này?"
                          className="text-black hover:text-red-700 hover:bg-red-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] md:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <Image className="h-4 w-4 md:h-5 md:w-5" />
              Ảnh phòng {viewingPhongName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {viewingImages.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent>
                  {viewingImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="flex items-center justify-center p-1 md:p-2">
                        <img
                          src={image}
                          alt={`Ảnh ${index + 1} của phòng ${viewingPhongName}`}
                          className="max-h-[50vh] md:max-h-[60vh] w-auto object-contain rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {viewingImages.length > 1 && (
                  <>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                  </>
                )}
              </Carousel>
            )}
          </div>
          
          <DialogFooter>
            <div className="text-xs md:text-sm text-gray-600">
              {viewingImages.length} ảnh {viewingImages.length > 1 && '- Vuốt để xem thêm'}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenants Viewer Dialog */}
      <Dialog open={isTenantsViewerOpen} onOpenChange={setIsTenantsViewerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto w-[95vw] md:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Danh sách người thuê - Phòng {viewingTenantsPhongName}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Tổng cộng {viewingTenants.length} người đang thuê phòng này
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 py-2 md:py-4">
            {viewingTenants.map((tenant, index) => (
              <Card key={tenant._id || index} className="overflow-hidden">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {tenant.hoTen}
                        </h3>
                        <Badge variant="outline" className="ml-2 text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-600">SĐT:</span>
                          <span className="text-gray-900">{tenant.soDienThoai || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTenantsViewerOpen(false)} className="text-sm">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form component for adding/editing phong
function PhongForm({ 
  phong, 
  toaNhaList,
  onClose, 
  onSuccess 
}: { 
  phong: Phong | null;
  toaNhaList: ToaNha[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  // Helper function để lấy toaNha ID
  const getToaNhaId = (toaNha: string | { _id: string }) => {
    if (typeof toaNha === 'object' && toaNha !== null) {
      return toaNha._id || '';
    } else if (typeof toaNha === 'string') {
      return toaNha;
    }
    return '';
  };

  const hopDongHienTai = phong?.hopDongHienTai;
  const khachThueMacDinh =
    hopDongHienTai?.nguoiDaiDien?._id ||
    hopDongHienTai?.khachThueId?.[0]?._id ||
    '';

  const [khachThueList, setKhachThueList] = useState<KhachThue[]>([]);
  const [formData, setFormData] = useState({
    maPhong: phong?.maPhong || '',
    toaNha: phong?.toaNha ? getToaNhaId(phong.toaNha) : '',
    tang: phong?.tang || 1,
    dienTich: phong?.dienTich || 0,
    giaThue: phong?.giaThue || 0,
    tienCoc: phong?.tienCoc || 0,
    moTa: phong?.moTa || '',
    anhPhong: phong?.anhPhong || [],
    tienNghi: phong?.tienNghi || [],
    soNguoiToiDa: phong?.soNguoiToiDa || 1,
    trangThai: phong?.trangThai || 'trong',
    thuePhong: {
      coNguoiThue: !!hopDongHienTai,
      khachThueId: khachThueMacDinh,
      ngayBatDau: hopDongHienTai?.ngayBatDau
        ? new Date(hopDongHienTai.ngayBatDau).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      ngayKetThuc: hopDongHienTai?.ngayKetThuc
        ? new Date(hopDongHienTai.ngayKetThuc).toISOString().split('T')[0]
        : '',
      trangThaiCuTru: (hopDongHienTai?.trangThaiCuTru || 'dangO') as 'dangO' | 'daTraPhong' | 'boCoc',
      hopDongId: hopDongHienTai?._id || '',
    },
  });

  useEffect(() => {
    fetch('/api/khach-thue?limit=200')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setKhachThueList(result.data || []);
      })
      .catch(() => {});
  }, []);

  // Cập nhật formData khi phong thay đổi
  useEffect(() => {
    if (phong) {
      const toaNhaId = getToaNhaId(phong.toaNha);
      
      console.log('Editing phong:', phong);
      console.log('toaNha object:', phong.toaNha);
      console.log('toaNha ID:', toaNhaId);
      
      const hd = phong.hopDongHienTai;
      const khachId = hd?.nguoiDaiDien?._id || hd?.khachThueId?.[0]?._id || '';
      setFormData({
        maPhong: phong.maPhong || '',
        toaNha: toaNhaId,
        tang: phong.tang || 1,
        dienTich: phong.dienTich || 0,
        giaThue: phong.giaThue || 0,
        tienCoc: phong.tienCoc || 0,
        moTa: phong.moTa || '',
        anhPhong: phong.anhPhong || [],
        tienNghi: phong.tienNghi || [],
        soNguoiToiDa: phong.soNguoiToiDa || 1,
        trangThai: phong.trangThai || 'trong',
        thuePhong: {
          coNguoiThue: !!hd,
          khachThueId: khachId,
          ngayBatDau: hd?.ngayBatDau
            ? new Date(hd.ngayBatDau).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          ngayKetThuc: hd?.ngayKetThuc
            ? new Date(hd.ngayKetThuc).toISOString().split('T')[0]
            : '',
          trangThaiCuTru: (hd?.trangThaiCuTru || 'dangO') as 'dangO' | 'daTraPhong' | 'boCoc',
          hopDongId: hd?._id || '',
        },
      });
    } else {
      setFormData({
        maPhong: '',
        toaNha: '',
        tang: 1,
        dienTich: 0,
        giaThue: 0,
        tienCoc: 0,
        moTa: '',
        anhPhong: [],
        tienNghi: [],
        soNguoiToiDa: 1,
        trangThai: 'trong',
        thuePhong: {
          coNguoiThue: false,
          khachThueId: '',
          ngayBatDau: new Date().toISOString().split('T')[0],
          ngayKetThuc: '',
          trangThaiCuTru: 'dangO',
          hopDongId: '',
        },
      });
    }
  }, [phong]);

  // Function format tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const tienNghiOptions = [
    { value: 'dieuhoa', label: 'Điều hòa' },
    { value: 'nonglanh', label: 'Nóng lạnh' },
    { value: 'tulanh', label: 'Tủ lạnh' },
    { value: 'giuong', label: 'Giường' },
    { value: 'tuquanao', label: 'Tủ quần áo' },
    { value: 'banlamviec', label: 'Bàn làm việc' },
    { value: 'ghe', label: 'Ghế' },
    { value: 'tivi', label: 'TV' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'maygiat', label: 'Máy giặt' },
    { value: 'bep', label: 'Bếp' },
    { value: 'noi', label: 'Nồi' },
    { value: 'chen', label: 'Chén' },
    { value: 'bat', label: 'Bát' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = phong ? `/api/phong/${phong._id}` : '/api/phong';
      const method = phong ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onSuccess();
        } else {
          toast.error(result.message || 'Có lỗi xảy ra');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Có lỗi xảy ra khi gửi form');
    }
  };

  const handleTienNghiChange = (tienNghi: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tienNghi: checked 
        ? [...prev.tienNghi, tienNghi]
        : prev.tienNghi.filter(t => t !== tienNghi)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <Tabs defaultValue="thong-tin" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 rounded-xl bg-muted/50">
          <TabsTrigger value="thong-tin" className="flex items-center gap-1.5 text-xs md:text-sm rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="nguoi-thue" className="flex items-center gap-1.5 text-xs md:text-sm rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Người thuê
          </TabsTrigger>
          <TabsTrigger value="anh-phong" className="flex items-center gap-1.5 text-xs md:text-sm rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Image className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Ảnh phòng
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="thong-tin" className="space-y-4 md:space-y-5 mt-4 md:mt-5">
          {/* Section: Basic Info */}
          <FormSection title="Thông tin cơ bản" description="Mã phòng, tòa nhà và trạng thái">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="maPhong" className="text-sm font-medium">Mã phòng</Label>
              <Input
                id="maPhong"
                value={formData.maPhong}
                onChange={(e) => setFormData(prev => ({ ...prev, maPhong: e.target.value.toUpperCase() }))}
                required
                className="rounded-xl h-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toaNha" className="text-sm font-medium">Tòa nhà</Label>
              <Select value={formData.toaNha} onValueChange={(value) => setFormData(prev => ({ ...prev, toaNha: value }))}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  {toaNhaList.map((toaNha) => (
                    <SelectItem key={toaNha._id} value={toaNha._id!}>
                      {toaNha.tenToaNha}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trangThai" className="text-sm font-medium">Trạng thái</Label>
              <Select value={formData.trangThai} onValueChange={(value) => setFormData(prev => ({ ...prev, trangThai: value as 'trong' | 'daDat' | 'dangThue' | 'baoTri' }))}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trong">Trống</SelectItem>
                  <SelectItem value="daDat">Đã đặt</SelectItem>
                  <SelectItem value="dangThue">Đang thuê</SelectItem>
                  <SelectItem value="baoTri">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Trạng thái Đang thuê/Đã đặt tự cập nhật khi gắn khách ở tab Người thuê
              </p>
            </div>
          </div>
          </FormSection>

          {/* Section: Room Details */}
          <FormSection title="Chi tiết phòng" description="Tầng, diện tích và sức chứa">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="tang" className="text-sm font-medium">Tầng</Label>
              <Input
                id="tang"
                type="number"
                min="0"
                value={formData.tang}
                onChange={(e) => setFormData(prev => ({ ...prev, tang: parseInt(e.target.value) || 0 }))}
                required
                className="rounded-xl h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dienTich" className="text-sm font-medium">Diện tích (m²)</Label>
              <Input
                id="dienTich"
                type="number"
                min="1"
                value={formData.dienTich}
                onChange={(e) => setFormData(prev => ({ ...prev, dienTich: parseInt(e.target.value) || 0 }))}
                required
                className="rounded-xl h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soNguoiToiDa" className="text-sm font-medium">Số người tối đa</Label>
              <Input
                id="soNguoiToiDa"
                type="number"
                min="1"
                max="10"
                value={formData.soNguoiToiDa}
                onChange={(e) => setFormData(prev => ({ ...prev, soNguoiToiDa: parseInt(e.target.value) || 1 }))}
                required
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs md:text-sm font-medium text-indigo-700">
                Phòng {formData.maPhong || 'XXX'} — Tầng {formData.tang}
              </div>
            </div>
          </div>
          </FormSection>

          {/* Section: Pricing */}
          <FormSection title="Giá thuê & Cọc" description="Thiết lập giá cho thuê và tiền đặt cọc">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="giaThue" className="text-sm font-medium">Giá thuê (VNĐ)</Label>
              <Input
                id="giaThue"
                type="number"
                min="0"
                value={formData.giaThue}
                onChange={(e) => setFormData(prev => ({ ...prev, giaThue: parseInt(e.target.value) || 0 }))}
                required
                className="rounded-xl h-10"
              />
              <span className="text-xs text-emerald-600 font-semibold">
                {formatCurrency(formData.giaThue)}
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tienCoc" className="text-sm font-medium">Tiền cọc (VNĐ)</Label>
              <Input
                id="tienCoc"
                type="number"
                min="0"
                value={formData.tienCoc}
                onChange={(e) => setFormData(prev => ({ ...prev, tienCoc: parseInt(e.target.value) || 0 }))}
                required
                className="rounded-xl h-10"
              />
              <span className="text-xs text-amber-600 font-semibold">
                {formatCurrency(formData.tienCoc)}
              </span>
            </div>
          </div>
          </FormSection>

          <FormSection title="Mô tả" description="Thông tin bổ sung về phòng">
          <Textarea
            id="moTa"
            value={formData.moTa}
            onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
            rows={3}
            className="rounded-xl resize-none"
            placeholder="Mô tả chi tiết về phòng..."
          />
          </FormSection>

          {/* Section: Amenities */}
          <FormSection title="Tiện nghi" description="Chọn các tiện nghi có sẵn trong phòng">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
              {tienNghiOptions.map((option) => (
                <AmenityTile
                  key={option.value}
                  id={option.value}
                  label={option.label}
                  checked={formData.tienNghi.includes(option.value)}
                  onChange={(checked) => handleTienNghiChange(option.value, checked)}
                />
              ))}
            </div>
            {formData.tienNghi.length > 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                Đã chọn {formData.tienNghi.length} tiện nghi
              </p>
            )}
          </FormSection>
        </TabsContent>

        <TabsContent value="nguoi-thue" className="space-y-4 md:space-y-5 mt-4 md:mt-5">
          <FormSection title="Thông tin người thuê" description="Gắn khách thuê và thông tin hợp đồng">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/60">
            <button
              type="button"
              role="switch"
              aria-checked={formData.thuePhong.coNguoiThue}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  thuePhong: { ...prev.thuePhong, coNguoiThue: !prev.thuePhong.coNguoiThue },
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
                formData.thuePhong.coNguoiThue ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                  formData.thuePhong.coNguoiThue ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <Label className="text-sm font-medium cursor-pointer">
              Phòng đã có người thuê
            </Label>
          </div>

          {formData.thuePhong.coNguoiThue ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Khách thuê</Label>
                <Select
                  value={formData.thuePhong.khachThueId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      thuePhong: { ...prev.thuePhong, khachThueId: value },
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder="Chọn khách thuê" />
                  </SelectTrigger>
                  <SelectContent>
                    {khachThueList.map((kt) => (
                      <SelectItem key={kt._id} value={kt._id!}>
                        {kt.hoTen}
                        {kt.soDienThoai ? ` — ${kt.soDienThoai}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ngày bắt đầu thuê</Label>
                <Input
                  type="date"
                  value={formData.thuePhong.ngayBatDau}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thuePhong: { ...prev.thuePhong, ngayBatDau: e.target.value },
                    }))
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ngày kết thúc (tùy chọn)</Label>
                <Input
                  type="date"
                  value={formData.thuePhong.ngayKetThuc}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thuePhong: { ...prev.thuePhong, ngayKetThuc: e.target.value },
                    }))
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Tình trạng cư trú</Label>
                <Select
                  value={formData.thuePhong.trangThaiCuTru}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      thuePhong: {
                        ...prev.thuePhong,
                        trangThaiCuTru: value as 'dangO' | 'daTraPhong' | 'boCoc',
                      },
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dangO">Đang ở</SelectItem>
                    <SelectItem value="daTraPhong">Đã trả phòng</SelectItem>
                    <SelectItem value="boCoc">Bỏ cọc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pt-2">
              Bỏ chọn nếu phòng trống. Hệ thống sẽ hiển thị &quot;Chưa cho thuê&quot; trên danh sách.
            </p>
          )}
          </FormSection>
        </TabsContent>
        
        <TabsContent value="anh-phong" className="space-y-4 md:space-y-5 mt-4 md:mt-5">
          <FormSection title="Quản lý ảnh phòng" description="Tải lên tối đa 10 ảnh để khách hàng xem chi tiết phòng">
            <PhongImageUpload
              images={formData.anhPhong}
              onImagesChange={(images: string[]) => setFormData(prev => ({ ...prev, anhPhong: images }))}
              maxImages={10}
              className="w-full"
            />
          </FormSection>
        </TabsContent>
      </Tabs>

      <DialogFooter className="gap-2 pt-2 border-t border-border/40">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl transition-all duration-200">
          Hủy
        </Button>
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 border-0 transition-all duration-200">
          {phong ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
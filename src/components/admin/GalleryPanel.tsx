'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ImageIcon, Loader2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { GalleryImage, ApiResponse } from '@/types';

export default function GalleryPanel() {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // New image form
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newOrder, setNewOrder] = useState('0');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data: ApiResponse<GalleryImage[]> = await res.json();
      if (data.success && data.data) {
        setImages(data.data);
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في تحميل المعرض', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رابط الصورة', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: newUrl.trim(),
          caption: newCaption.trim() || null,
          display_order: Number(newOrder) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'تم الإضافة', description: 'تم إضافة الصورة بنجاح' });
        setNewUrl('');
        setNewCaption('');
        setNewOrder('0');
        setDialogOpen(false);
        fetchGallery();
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في إضافة الصورة', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/gallery?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'تم الحذف', description: 'تم حذف الصورة بنجاح' });
        fetchGallery();
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل في حذف الصورة', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">إدارة المعرض</h2>
          <p className="text-sm text-gray-500 mt-1">إضافة وحذف صور العيادة ({images.length} صورة)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">
              <Plus className="w-4 h-4 ml-2" />
              إضافة صورة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة صورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>رابط الصورة *</Label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="mt-1.5 text-left"
                  dir="ltr"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label>الوصف (اختياري)</Label>
                <Input
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="mt-1.5 text-right"
                  placeholder="وصف الصورة"
                />
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(e.target.value)}
                  className="mt-1.5 text-right"
                  dir="ltr"
                />
              </div>
              {newUrl && (
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={newUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Button
                onClick={handleAdd}
                disabled={adding || !newUrl.trim()}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {adding ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                إضافة الصورة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">لا توجد صور في المعرض</p>
            <p className="text-gray-300 text-sm mt-1">أضف صوراً لعرضها في صفحة العيادة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <Card key={img.id} className="border-0 shadow-sm group relative overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={img.image_url}
                    alt={img.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                      onClick={() => setDeleteId(img.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Order badge */}
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-medium text-gray-600">
                    #{img.display_order}
                  </div>
                </div>
                {img.caption && (
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{img.caption}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الصورة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

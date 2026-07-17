import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "./AdminLayout";
import { Plus, Trash, ArrowLeft, ArrowRight, Save, Globe, Info, Loader2, Edit, X, AlertTriangle } from "lucide-react";
import { fetchAdminInstagramGallery, createAdminInstagramGalleryItem, updateAdminInstagramGalleryItem, deleteAdminInstagramGalleryItem, InstagramGalleryItem } from "@/lib/homepageApi";
import { toast } from "@/hooks/use-toast";

export default function AdminInstagramGallery() {
  const [items, setItems] = useState<InstagramGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<InstagramGalleryItem | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editInstUrl, setEditInstUrl] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminInstagramGallery();
      const sorted = [...data].sort((a, b) => a.sort_order - b.sort_order);
      setItems(sorted);
    } catch (error: any) {
      toast({
        title: "Failed to load gallery",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("alt_text", "As Worn Image");
    formData.append("instagram_url", "https://instagram.com");
    formData.append("is_enabled", "1");
    formData.append("sort_order", String(items.length));

    try {
      setUploading(true);
      await createAdminInstagramGalleryItem(formData);
      toast({
        title: "Image Uploaded",
        description: "The new gallery photo was successfully uploaded.",
      });
      loadGallery();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openEditModal = (item: InstagramGalleryItem) => {
    setEditingItem(item);
    setEditAltText(item.alt_text || "");
    setEditInstUrl(item.instagram_url || "");
    setEditFile(null);
    setEditPreviewUrl(item.image_path);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setSavingEdit(true);
      const formData = new FormData();
      if (editFile) {
        formData.append("image", editFile);
      }
      formData.append("alt_text", editAltText);
      formData.append("instagram_url", editInstUrl);
      formData.append("is_enabled", editingItem.is_enabled ? "1" : "0");
      formData.append("sort_order", String(editingItem.sort_order));

      await updateAdminInstagramGalleryItem(editingItem.id, formData);
      toast({
        title: "Gallery Item Updated",
        description: "Your changes have been saved.",
      });
      setEditingItem(null);
      loadGallery();
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleEnabled = async (item: InstagramGalleryItem) => {
    try {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_enabled: !i.is_enabled } : i));
      await updateAdminInstagramGalleryItem(item.id, { is_enabled: !item.is_enabled });
      toast({
        title: item.is_enabled ? "Image Disabled" : "Image Enabled",
        description: `Image status has been successfully updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
      loadGallery();
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAdminInstagramGalleryItem(deletingId);
      toast({
        title: "Image Deleted",
        description: "The gallery photo was successfully removed.",
      });
      setDeletingId(null);
      loadGallery();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveItem = async (index: number, direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[nextIndex];
    newItems[nextIndex] = temp;

    setItems(newItems.map((item, idx) => ({ ...item, sort_order: idx })));

    try {
      await Promise.all([
        updateAdminInstagramGalleryItem(newItems[index].id, { sort_order: nextIndex }),
        updateAdminInstagramGalleryItem(newItems[nextIndex].id, { sort_order: index })
      ]);
    } catch (e) {
      console.error("Sorting sync failed", e);
      loadGallery();
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Instagram Gallery</h1>
            <p className="text-sm text-muted-foreground">Manage files, links, and sorting order of the homepage feed section</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Upload Photo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading gallery photos...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/40 bg-card rounded-md">
            <p className="text-muted-foreground mb-4">No gallery items available.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary/90 transition-colors"
            >
              Upload Your First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <InstagramCard
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                onEdit={openEditModal}
                onDelete={confirmDelete}
                onToggleEnabled={handleToggleEnabled}
                onMove={moveItem}
              />
            ))}
          </div>
        )}

        {/* Edit Modal Overlay */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded relative">
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif text-lg mb-4 text-foreground">Edit Gallery Image</h3>

              <div className="space-y-4">
                {/* Image Preview and Upload Overwrite */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Current Image
                  </label>
                  <div className="aspect-square relative overflow-hidden bg-muted/20 border border-border/40 max-w-[200px] mx-auto">
                    <img
                      src={editPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <button
                      onClick={() => editFileInputRef.current?.click()}
                      className="text-xs text-accent hover:text-accent/80 font-medium transition-colors cursor-pointer"
                    >
                      Replace Image (Overwrite)
                    </button>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={handleEditFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Alt Text Input */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5" /> Alt Text (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe the clothing or person worn..."
                    className="w-full bg-transparent border border-border/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Instagram Post Link */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Globe className="w-3.5 h-3.5" /> Instagram Post URL
                  </label>
                  <input
                    type="text"
                    value={editInstUrl}
                    onChange={(e) => setEditInstUrl(e.target.value)}
                    placeholder="https://instagram.com/p/..."
                    className="w-full bg-transparent border border-border/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Save & Cancel Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border/10">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 border border-border/40 hover:bg-muted text-xs uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 rounded-sm"
                  >
                    {savingEdit && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal Overlay */}
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full max-w-sm p-6 rounded relative text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <h3 className="font-serif text-lg mb-2 text-foreground">Confirm Deletion</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this image?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-6 py-2.5 border border-border/40 hover:bg-muted text-xs uppercase tracking-widest transition-colors rounded-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs uppercase tracking-widest transition-colors rounded-sm flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

interface InstagramCardProps {
  item: InstagramGalleryItem;
  index: number;
  total: number;
  onEdit: (item: InstagramGalleryItem) => void;
  onDelete: (id: number) => void;
  onToggleEnabled: (item: InstagramGalleryItem) => void;
  onMove: (index: number, direction: 'left' | 'right') => void;
}

function InstagramCard({ item, index, total, onEdit, onDelete, onToggleEnabled, onMove }: InstagramCardProps) {
  return (
    <div className={`bg-card border transition-all ${item.is_enabled ? "border-border/20 shadow-sm" : "border-border/10 opacity-60"}`}>
      <div className="aspect-square relative overflow-hidden bg-muted/20">
        <img
          src={item.image_path}
          alt={item.alt_text || "Instagram Post"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => onToggleEnabled(item)}
            className={`px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold border rounded-sm ${item.is_enabled ? "bg-accent text-accent-foreground border-accent" : "bg-background text-muted-foreground border-border/40"}`}
          >
            {item.is_enabled ? "Active" : "Disabled"}
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {/* Compact Metadata view */}
        <div className="text-[10px] text-muted-foreground truncate" title={item.alt_text || "No Alt text"}>
          <span className="font-semibold text-foreground">Alt:</span> {item.alt_text || "—"}
        </div>
        <div className="text-[10px] text-muted-foreground truncate" title={item.instagram_url || "No link"}>
          <span className="font-semibold text-foreground">Link:</span> {item.instagram_url ? item.instagram_url.replace("https://", "") : "—"}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-border/10">
          <div className="flex gap-0.5">
            <button
              onClick={() => onMove(index, 'left')}
              disabled={index === 0}
              className="p-1 hover:text-accent disabled:opacity-20 transition-opacity"
              title="Move Left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMove(index, 'right')}
              disabled={index === total - 1}
              className="p-1 hover:text-accent disabled:opacity-20 transition-opacity"
              title="Move Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onEdit(item)}
              className="p-1 hover:text-accent text-muted-foreground transition-colors"
              title="Edit Post"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete Photo"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

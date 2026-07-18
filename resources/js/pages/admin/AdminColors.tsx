import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Plus, Search, Edit2, Trash2, X, Loader2, Save } from "lucide-react";
import { fetchAdminColors, createColor, updateColor, deleteColor } from "@/lib/productApi";
import { toast } from "@/hooks/use-toast";

interface ColorItem {
  id: number;
  name: string;
  hex: string;
  products_count?: number;
}

export default function AdminColors() {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);

  // Form Fields
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete Confirm State
  const [deletingColor, setDeletingColor] = useState<ColorItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadColors = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminColors();
      setColors(data);
    } catch (err: any) {
      toast({
        title: "Failed to load colors",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedColor(null);
    setColorName("");
    setColorHex("#000000");
    setErrorMsg("");
    setShowModal(true);
  };

  const openEditModal = (color: ColorItem) => {
    setModalMode("edit");
    setSelectedColor(color);
    setColorName(color.name);
    setColorHex(color.hex);
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) {
      setErrorMsg("Color name is required.");
      return;
    }
    if (!colorHex.trim()) {
      setErrorMsg("Hex code is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      if (modalMode === "create") {
        await createColor({ name: colorName, hex: colorHex });
        toast({ title: "Color created successfully" });
      } else if (modalMode === "edit" && selectedColor) {
        await updateColor(selectedColor.id, { name: colorName, hex: colorHex });
        toast({ title: "Color updated successfully" });
      }
      setShowModal(false);
      loadColors();
    } catch (err: any) {
      const msg = err.response?.data?.message || "An error occurred while saving.";
      setErrorMsg(msg);
      toast({
        title: "Failed to save color",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteColor = async () => {
    if (!deletingColor) return;
    setDeleting(true);
    try {
      await deleteColor(deletingColor.id);
      toast({ title: "Color deleted successfully" });
      setDeletingColor(null);
      loadColors();
    } catch (err: any) {
      toast({
        title: "Failed to delete color",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredColors = colors.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.hex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1 text-foreground">Manage Colors</h1>
            <p className="text-sm text-muted-foreground">
              Master color library for J Atelier products and homepage collections.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer font-medium rounded-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Color
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border/40 p-4 mb-6 rounded-sm relative flex items-center">
          <Search className="absolute left-7 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search color by name or hex code..."
            className="w-full bg-transparent border border-border/30 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-accent transition-colors rounded-sm"
          />
        </div>

        {/* Colors Grid */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
            Loading master color library...
          </div>
        ) : filteredColors.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/40 bg-card rounded-sm max-w-md mx-auto">
            <p className="text-muted-foreground mb-4 text-sm font-medium">
              {searchQuery ? "No matching colors found." : "No colors created yet."}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary/90 transition-colors rounded-sm cursor-pointer"
              >
                Create Your First Color
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredColors.map((color) => (
              <div
                key={color.id}
                className="bg-card border border-border/20 shadow-sm flex flex-col justify-between group hover:border-border transition-all rounded-sm overflow-hidden"
              >
                {/* Live Swatch Preview */}
                <div
                  className="w-full aspect-[4/3] border-b border-sidebar-border relative"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Color Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-base text-foreground font-semibold flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border/30 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground uppercase mt-1">
                      {color.hex}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                      Used by {color.products_count ?? 0} Product{(color.products_count ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/10">
                    <button
                      onClick={() => openEditModal(color)}
                      className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground hover:text-accent px-2.5 py-1.5 border border-border/30 hover:border-accent transition-colors rounded-sm cursor-pointer"
                      title="Edit Color"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingColor(color)}
                      className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground hover:text-destructive px-2.5 py-1.5 border border-border/30 hover:border-destructive transition-colors rounded-sm cursor-pointer"
                      title="Delete Color"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Color Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full max-w-md overflow-hidden flex flex-col rounded-sm">
              <div className="p-4 border-b border-border/20 flex items-center justify-between">
                <h3 className="font-serif text-lg text-foreground">
                  {modalMode === "create" ? "Add New Color" : "Edit Color"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveColor} className="p-6 space-y-4">
                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-sm">
                    {errorMsg}
                  </p>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-semibold">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    placeholder="e.g. Classic Olive, Vintage Burgundy"
                    className="w-full bg-background border border-border/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent transition-colors rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-semibold">
                    Hex Color & Live Swatch
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-10 h-10 p-0 border border-border/40 bg-transparent cursor-pointer rounded-sm flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      placeholder="#000000"
                      className="w-full bg-background border border-border/40 px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-accent transition-colors rounded-sm uppercase"
                    />
                  </div>
                </div>

                {/* Swatch Preview Banner */}
                <div className="pt-2">
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                    Live Swatch Preview
                  </span>
                  <div
                    className="w-full h-12 border border-border/40 rounded-sm shadow-sm transition-all"
                    style={{ backgroundColor: colorHex }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-border/40 hover:bg-muted text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer flex items-center gap-1.5 font-semibold"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <Save className="w-3.5 h-3.5" />
                    Save Color
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingColor && (
          <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full max-w-sm p-6 rounded-sm flex flex-col space-y-4">
              <h3 className="font-serif text-lg text-foreground">Delete Color</h3>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete the color <strong className="text-foreground">"{deletingColor.name}"</strong>?
                </p>
                {deletingColor.products_count && deletingColor.products_count > 0 ? (
                  <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3 rounded-sm font-medium">
                    Warning: This color is currently used by {deletingColor.products_count} product(s). 
                    Deleting it will remove the assignment from those products.
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingColor(null)}
                  disabled={deleting}
                  className="px-4 py-2 border border-border/40 hover:bg-muted text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteColor}
                  disabled={deleting}
                  className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer flex items-center gap-1.5"
                >
                  {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
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

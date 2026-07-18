import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { ArrowLeft, ArrowRight, Trash2, Plus, Search, X, Save, Loader2, Info } from "lucide-react";
import { fetchAdminShopByColor, saveAdminShopByColor, AdminHomepageColor } from "@/lib/homepageApi";
import { toast } from "@/hooks/use-toast";

export default function AdminShopByColor() {
  const [allColors, setAllColors] = useState<AdminHomepageColor[]>([]);
  const [activeColors, setActiveColors] = useState<AdminHomepageColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [colorToRemove, setColorToRemove] = useState<number | null>(null);

  const loadColors = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminShopByColor();
      setAllColors(data);
      
      // Filter only colors set to display on homepage, sorted by homepage_sort_order
      const active = data
        .filter(c => c.show_on_homepage)
        .sort((a, b) => a.homepage_sort_order - b.homepage_sort_order);
      setActiveColors(active);
    } catch (error: any) {
      toast({
        title: "Failed to load colors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const handleAddColor = (color: AdminHomepageColor) => {
    // Prevent duplicates
    if (activeColors.some(ac => ac.id === color.id)) {
      toast({ title: "Color already added" });
      return;
    }

    const updatedColor = {
      ...color,
      show_on_homepage: true,
      homepage_sort_order: activeColors.length + 1
    };

    setActiveColors(prev => [...prev, updatedColor]);
    toast({ title: `${color.name} added to homepage list.` });
    setShowAddModal(false);
  };

  const handleRemoveColor = (id: number) => {
    setColorToRemove(id);
  };

  const confirmRemoveColor = (id: number) => {
    setActiveColors(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // Re-index sort orders sequentially
      return filtered.map((c, index) => ({
        ...c,
        homepage_sort_order: index + 1
      }));
    });
    toast({ title: "Color removed from homepage list." });
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= activeColors.length) return;

    const newActive = [...activeColors];
    const temp = newActive[index];
    newActive[index] = newActive[nextIndex];
    newActive[nextIndex] = temp;

    // Update sort weights sequentially
    const updated = newActive.map((c, i) => ({
      ...c,
      homepage_sort_order: i + 1
    }));

    setActiveColors(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Map all colors in the system.
      // If a color is active: show_on_homepage = true, sort_order = its position in active list
      // If a color is inactive: show_on_homepage = false, sort_order = 0
      const payload = allColors.map(originalColor => {
        const activeIndex = activeColors.findIndex(ac => ac.id === originalColor.id);
        if (activeIndex !== -1) {
          return {
            id: originalColor.id,
            show_on_homepage: true,
            homepage_sort_order: activeIndex + 1,
          };
        } else {
          return {
            id: originalColor.id,
            show_on_homepage: false,
            homepage_sort_order: 0,
          };
        }
      });

      await saveAdminShopByColor(payload);
      toast({
        title: "Configuration Saved",
        description: "Homepage curated palettes section settings updated successfully.",
      });
      loadColors();
    } catch (error: any) {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter pool of colors available to add (not currently active)
  const availableToSelect = allColors
    .filter(c => !activeColors.some(ac => ac.id === c.id))
    .filter(c => c.name.toLowerCase().includes(modalSearchQuery.toLowerCase()));

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Shop by Color</h1>
            <p className="text-sm text-muted-foreground">Manage colors featured in the homepage curated palettes section</p>
          </div>
          
          <div className="flex gap-2 items-center">
            {activeColors.length >= 4 ? (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded font-medium mr-2 max-w-sm">
                <Info className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                <span>You can feature up to 4 colors. Remove one to add another.</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setModalSearchQuery("");
                }}
                disabled={loading}
                className="border border-border/40 hover:bg-background text-xs uppercase tracking-widest px-6 py-3 flex items-center gap-1.5 transition-colors cursor-pointer mr-2"
              >
                <Plus className="w-4 h-4" />
                Add Color
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Configuration
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading configurations...</div>
        ) : activeColors.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/40 bg-card rounded-md max-w-xl mx-auto">
            <p className="text-muted-foreground mb-4 font-medium">No colors added yet.</p>
            <button
              onClick={() => {
                setShowAddModal(true);
                setModalSearchQuery("");
              }}
              className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-6 py-3 hover:bg-primary/90 transition-colors"
            >
              Add Your First Color
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeColors.map((color, index) => (
              <div 
                key={color.id} 
                className="bg-card border border-border/20 shadow-sm flex flex-col justify-between group hover:border-border transition-colors rounded-sm overflow-hidden"
              >
                {/* Large Color Swatch */}
                <div 
                  className="w-full aspect-[4/3] border-b border-sidebar-border" 
                  style={{ backgroundColor: color.hex }}
                />
                
                {/* Content Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-serif text-base text-foreground mb-1 font-semibold">{color.name}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {color.products_count !== undefined 
                        ? `Used by ${color.products_count} product${color.products_count === 1 ? '' : 's'}` 
                        : 'Used by 0 products'}
                    </p>
                  </div>

                  {/* Drag/Reorder Handles and Trash */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/10">
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => moveItem(index, 'left')}
                        disabled={index === 0}
                        className="p-1 hover:text-accent disabled:opacity-20 transition-opacity"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'right')}
                        disabled={index === activeColors.length - 1}
                        className="p-1 hover:text-accent disabled:opacity-20 transition-opacity"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono bg-muted/40 px-2 py-0.5 rounded text-muted-foreground font-semibold">
                        Pos: {index + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveColor(color.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        title="Remove from Homepage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Color Searchable Modal Overlay */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col rounded">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-border/20 flex items-center justify-between">
                <h3 className="font-serif text-lg text-foreground">Add Color to Shop by Color</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Search Input */}
              <div className="p-4 border-b border-border/10 bg-muted/10 relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Search color name..."
                  className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-accent rounded-sm"
                />
              </div>

              {/* Modal Color List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {availableToSelect.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">
                    {modalSearchQuery ? "No matching colors found." : "All colors have already been added."}
                  </p>
                ) : (
                  availableToSelect.map(color => (
                    <div 
                      key={color.id} 
                      className="flex items-center justify-between border border-border/20 p-2.5 rounded-sm hover:bg-card/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-5 h-5 rounded-full border border-border/40"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-xs font-semibold">{color.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {color.products_count !== undefined 
                              ? `Used by ${color.products_count} product${color.products_count === 1 ? '' : 's'}` 
                              : 'Used by 0 products'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddColor(color)}
                        className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-primary/95 transition-colors rounded-sm cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border/20 flex justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border/40 hover:bg-muted text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Remove confirmation modal */}
        {colorToRemove !== null && (
          <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full max-w-sm p-6 rounded flex flex-col space-y-4">
              <h3 className="font-serif text-lg text-foreground">Remove Featured Color</h3>
              <p className="text-xs text-muted-foreground">Are you sure you want to remove this featured color?</p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setColorToRemove(null)}
                  className="px-4 py-2 border border-border/40 hover:bg-muted text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmRemoveColor(colorToRemove);
                    setColorToRemove(null);
                  }}
                  className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

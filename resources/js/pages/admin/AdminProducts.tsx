import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Plus, Search, Edit2, Trash2, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, PaginatedProducts, fetchAdminColors, fetchCollections, CollectionItem } from "@/lib/productApi";
import { clearProductCache } from "@/hooks/useProducts";
import { Product, ProductColor } from "@/types/product";
import { toast } from "@/hooks/use-toast";

export default function AdminProducts() {
  const [paginatedData, setPaginatedData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("");
  const [page, setPage] = useState(1);
  const [dbCollections, setDbCollections] = useState<CollectionItem[]>([]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  // Product fields form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    collection: "new-arrivals",
    colors: [] as ProductColor[],
    sizes: [] as ("XS" | "S" | "M" | "L")[],
    images: [] as string[],
    story: "",
    fabric_details: "",
    care_instructions: "",
    rating: "5.0",
    review_count: "0",
    stock: "0",
    in_stock: true,
    active: true,
    featured: false,
    is_best_seller: false,
    is_new: false,
    sort_order: "0",
  });

  const [availableColors, setAvailableColors] = useState<{ id: number; name: string; hex: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // States for inline color editing
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [replaceColorSearchQuery, setReplaceColorSearchQuery] = useState("");
  const [showReplaceSuggestions, setShowReplaceSuggestions] = useState(false);
  const [tempSelectedColor, setTempSelectedColor] = useState<ProductColor | null>(null);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [colorsData, collectionsData] = await Promise.all([
          fetchAdminColors(),
          fetchCollections(),
        ]);
        setAvailableColors(colorsData);
        setDbCollections(collectionsData);
      } catch (err) {
        console.error("Failed to load admin initial data", err);
      }
    };
    loadInitData();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (query) params.query = query;
      if (collection) params.collection = collection;
      
      const data = await fetchAdminProducts(params);
      setPaginatedData(data);
    } catch (error: any) {
      toast({
        title: "Failed to load products",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, collection]);

  // Debounce query search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setValidationErrors({});
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      collection: "new-arrivals",
      colors: [],
      sizes: ["XS", "S", "M", "L"],
      images: [],
      story: "",
      fabric_details: "",
      care_instructions: "",
      rating: "5.0",
      review_count: "0",
      stock: "0",
      in_stock: true,
      active: true,
      featured: false,
      is_best_seller: false,
      is_new: true,
      sort_order: "0",
    });
    setShowForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setValidationErrors({});
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      collection: product.collection,
      colors: product.colors || [],
      sizes: product.sizes || [],
      images: product.images || [],
      story: product.story || "",
      fabric_details: product.fabricDetails || "",
      care_instructions: product.careInstructions || "",
      rating: product.rating.toString(),
      review_count: product.reviewCount.toString(),
      stock: product.stock.toString(),
      in_stock: product.inStock,
      active: product.active !== false,
      featured: product.featured || false,
      is_best_seller: product.isBestSeller || false,
      is_new: product.isNew || false,
      sort_order: (product.sortOrder ?? 0).toString(),
    });
    setShowForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        rating: parseFloat(form.rating),
        review_count: parseInt(form.review_count),
        stock: parseInt(form.stock),
        sort_order: parseInt(form.sort_order),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct(payload);
        toast({ title: "Product created successfully" });
      }
      
      clearProductCache();
      setShowForm(false);
      loadProducts();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast({
          title: "Failed to save product",
          description: error.response?.data?.message || error.message,
          variant: "destructive"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      clearProductCache();
      loadProducts();
      toast({ title: "Product deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStartEdit = (index: number, color?: ProductColor) => {
    setEditingColorIndex(index);
    if (color) {
      setReplaceColorSearchQuery(color.name);
      setTempSelectedColor(color);
    } else {
      setReplaceColorSearchQuery("");
      setTempSelectedColor(null);
    }
    setShowReplaceSuggestions(false);
  };

  const handleSaveProductColor = (index: number) => {
    if (!tempSelectedColor) {
      toast({
        title: "Please select a color",
        description: "You must choose an existing color from the suggestions.",
        variant: "destructive"
      });
      return;
    }

    // Check duplicates
    if (form.colors.some((c, idx) => c.id === tempSelectedColor.id && idx !== index)) {
      toast({
        title: "Color already assigned",
        description: "This color is already added to the product.",
        variant: "destructive"
      });
      return;
    }

    const updatedColors = [...form.colors];
    if (index === form.colors.length) {
      // Adding a new color slot
      updatedColors.push(tempSelectedColor);
    } else {
      // Editing existing color
      updatedColors[index] = tempSelectedColor;
    }

    setForm({
      ...form,
      colors: updatedColors
    });

    setEditingColorIndex(null);
    setTempSelectedColor(null);
    setReplaceColorSearchQuery("");
    toast({ title: index === form.colors.length ? "Color added to product" : "Product color updated successfully" });
  };

  const handleRemoveProductColor = (colorId?: number) => {
    if (!colorId) return;
    setForm({
      ...form,
      colors: form.colors.filter(c => c.id !== colorId)
    });
    toast({ title: "Color removed from product" });
  };

  const handleSizeToggle = (size: "XS" | "S" | "M" | "L") => {
    if (form.sizes.includes(size)) {
      setForm({ ...form, sizes: form.sizes.filter(s => s !== size) });
    } else {
      setForm({ ...form, sizes: [...form.sizes, size] });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setForm({
        ...form,
        images: [...form.images, url]
      });
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Image upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index)
    });
  };

  const productsList = paginatedData?.data || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Products</h1>
            <p className="text-sm text-muted-foreground">
              {paginatedData?.meta.total || 0} pieces in catalogue
            </p>
          </div>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-add-product">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Product
          </button>
        </div>

        <div className="bg-card">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-product-search"
              />
            </div>
            <select
              value={collection}
              onChange={(e) => { setCollection(e.target.value); setPage(1); }}
              className="bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer"
              data-testid="select-admin-collection-filter"
            >
              <option value="">All Collections</option>
              {dbCollections.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Product", "Collection", "Price", "Stock", "Rating", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Loading products...</td>
                </tr>
              ) : productsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No products found.</td>
                </tr>
              ) : productsList.map((product) => (
                <tr key={product.id} className="hover:bg-card/50 transition-colors" data-testid={`admin-product-row-${product.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-10 h-12 object-cover flex-shrink-0 bg-background" />
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{product.collection.replace(/-/g, " ")}</td>
                  <td className="py-3 px-4">${product.price}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${product.inStock ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">{product.rating} ({product.reviewCount})</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(product)} className="p-1.5 hover:text-accent transition-colors" data-testid={`button-edit-product-${product.id}`} aria-label="Edit">
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 hover:text-destructive transition-colors" data-testid={`button-delete-product-${product.id}`} aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4 border-t border-border/20 text-xs text-muted-foreground">
            <div>
              Showing {paginatedData?.meta.from || 0} to {paginatedData?.meta.to || 0} of {paginatedData?.meta.total || 0} products
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Previous
              </button>
              <button
                disabled={!paginatedData?.links.next}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Add/Edit Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-background border border-border w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <h2 className="font-serif text-2xl">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-card/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Product Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.name[0]}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Slug (Leave blank to generate automatically)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. aurora-pullover-hoodie-ivory"
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  {validationErrors.slug && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.slug[0]}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.description[0]}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  {validationErrors.price && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.price[0]}</p>
                  )}
                </div>

                {/* Collection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Collection</label>
                  <select
                    value={form.collection}
                    onChange={(e) => setForm({ ...form, collection: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {dbCollections.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                  {validationErrors.collection && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.collection[0]}</p>
                  )}
                </div>



                {/* Sort Order */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  {validationErrors.sort_order && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.sort_order[0]}</p>
                  )}
                </div>

                {/* Sizes Selection */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Available Sizes</label>
                  <div className="flex gap-4">
                    {(["XS", "S", "M", "L"] as const).map((sz) => (
                      <label key={sz} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={form.sizes.includes(sz)}
                          onChange={() => handleSizeToggle(sz)}
                          className="w-4 h-4"
                        />
                        <span>{sz}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colors Manager */}
                <div className="md:col-span-2 border border-border/30 p-4 bg-card/30 space-y-4">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground">Manage Colors</label>
                  
                  {/* Current Product Colors list */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Product Colors</p>
                    {form.colors.length === 0 && editingColorIndex === null ? (
                      <p className="text-xs text-muted-foreground italic mb-2">No colors assigned to this product.</p>
                    ) : null}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                      {form.colors.map((color, index) => (
                        <div key={color.id || index} className="contents">
                          {editingColorIndex === index ? (
                            <div className="flex items-center justify-between bg-background/50 border border-border/40 p-2 rounded-sm hover:border-border transition-colors">
                              <div className="flex items-center gap-2 flex-1 relative mr-2">
                                <span 
                                  className="w-4 h-4 rounded-full border border-border/40 flex-shrink-0" 
                                  style={{ backgroundColor: tempSelectedColor?.hex || color.hex || "#CCCCCC" }} 
                                />
                                <div className="relative flex-1">
                                  <input
                                    type="text"
                                    value={replaceColorSearchQuery}
                                    onChange={(e) => {
                                      setReplaceColorSearchQuery(e.target.value);
                                      setShowReplaceSuggestions(true);
                                      const matched = availableColors.find(
                                        ac => ac.name.toLowerCase() === e.target.value.toLowerCase()
                                      );
                                      if (matched) {
                                        setTempSelectedColor(matched);
                                      } else {
                                        setTempSelectedColor(null);
                                      }
                                    }}
                                    onFocus={() => setShowReplaceSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowReplaceSuggestions(false), 200)}
                                    placeholder="Search color name..."
                                    className="w-full bg-background border border-border/40 px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
                                  />
                                  
                                  {showReplaceSuggestions && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-background border border-border shadow-lg max-h-40 overflow-y-auto rounded-sm">
                                      {availableColors
                                        .filter(col => col.name.toLowerCase().includes(replaceColorSearchQuery.toLowerCase()))
                                        .map(col => {
                                          const isAdded = form.colors.some((c, idx) => c.id === col.id && idx !== index);
                                          return (
                                            <button
                                              key={col.id}
                                              type="button"
                                              disabled={isAdded}
                                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent/10 flex items-center justify-between border-b border-border/10 last:border-b-0 ${isAdded ? "opacity-50 cursor-not-allowed bg-muted/10" : ""}`}
                                              onClick={() => {
                                                if (!isAdded) {
                                                  setReplaceColorSearchQuery(col.name);
                                                  setTempSelectedColor(col);
                                                  setShowReplaceSuggestions(false);
                                                }
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full border border-border/40" style={{ backgroundColor: col.hex }} />
                                                <span>{col.name}</span>
                                              </div>
                                              {isAdded && <span className="text-[9px] text-muted-foreground uppercase font-mono">Added</span>}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleSaveProductColor(index)}
                                  className="p-1 text-accent hover:text-accent/80 transition-colors font-medium text-sm cursor-pointer"
                                  title="Save color"
                                >
                                  💾
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingColorIndex(null);
                                    setTempSelectedColor(null);
                                    setReplaceColorSearchQuery("");
                                  }}
                                  className="p-1 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm cursor-pointer"
                                  title="Cancel"
                                >
                                  ✖
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between bg-background/50 border border-border/40 p-2.5 rounded-sm hover:border-border transition-colors">
                              <div className="flex items-center gap-2.5">
                                <span 
                                  className="w-4 h-4 rounded-full border border-border/40 flex-shrink-0" 
                                  style={{ backgroundColor: color.hex }} 
                                />
                                <span className="text-xs font-medium">{color.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(index, color)}
                                  className="p-1 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                                  title="Edit Color"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductColor(color.id)}
                                  className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                  title="Remove Color"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
 
                  {validationErrors.colors && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.colors[0]}</p>
                  )}
                </div>

                {/* Images Manager */}
                <div className="md:col-span-2 border border-border/30 p-4 bg-card/30 space-y-4">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground">Product Images</label>
                  
                  {/* Images List */}
                  <div className="grid grid-cols-4 gap-4">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group border border-border aspect-square bg-background">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1 text-muted-foreground rounded-full transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Image Uploader */}
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 border border-border/40 px-4 py-3 text-xs uppercase tracking-widest hover:border-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {validationErrors.images && (
                    <p className="text-xs text-destructive">{validationErrors.images[0]}</p>
                  )}
                </div>

                {/* Story */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">The Story</label>
                  <textarea
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Fabric Details */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Fabric Details</label>
                  <input
                    value={form.fabric_details}
                    onChange={(e) => setForm({ ...form, fabric_details: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Care Instructions */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Care Instructions</label>
                  <input
                    value={form.care_instructions}
                    onChange={(e) => setForm({ ...form, care_instructions: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Initial Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Review Count */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Review Count</label>
                  <input
                    type="number"
                    min="0"
                    value={form.review_count}
                    onChange={(e) => setForm({ ...form, review_count: e.target.value })}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Stock and Status */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-card/10 p-4 border border-border/20">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    {validationErrors.stock && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.stock[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Stock Status</label>
                    <select
                      value={form.in_stock ? "true" : "false"}
                      onChange={(e) => setForm({ ...form, in_stock: e.target.value === "true" })}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Active</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Featured</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest">
                    <input
                      type="checkbox"
                      checked={form.is_best_seller}
                      onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest col-span-2 md:col-span-1">
                    <input
                      type="checkbox"
                      checked={form.is_new}
                      onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex gap-4 border-t border-border/20 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-border/40 px-8 py-3.5 text-xs uppercase tracking-widest hover:border-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

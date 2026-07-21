import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "./AdminLayout";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Monitor, Smartphone } from "lucide-react";
import {
  HeroBanner,
  fetchAdminHeroBanner,
  saveAdminHeroBanner,
} from "@/lib/homepageApi";

const DEFAULT_BANNER: HeroBanner = {
  small_heading: "Spring / Summer 2025",
  main_heading_line1: "The Art of",
  main_heading_line2: "Unhurried Style",
  primary_btn_text: "Discover Collection",
  primary_btn_url: "/shop",
  secondary_btn_text: "Limited Edition",
  secondary_btn_url: "/shop?collection=limited-edition",
  desktop_image_path:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90",
  mobile_image_path: null,
};

export default function AdminHeroBanner() {
  const [form, setForm] = useState<HeroBanner>(DEFAULT_BANNER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Image states
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
  const [removeMobileImage, setRemoveMobileImage] = useState(false);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdminHeroBanner()
      .then((data) => {
        setForm(data);
      })
      .catch(() => {
        toast({
          title: "Could not load hero banner",
          description: "Using default values. You can still save changes.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof HeroBanner, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDesktopImageFile(file);
    setDesktopImagePreview(URL.createObjectURL(file));
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMobileImageFile(file);
    setMobileImagePreview(URL.createObjectURL(file));
    setRemoveMobileImage(false);
  };

  const handleRemoveMobileImage = () => {
    setMobileImageFile(null);
    setMobileImagePreview(null);
    setRemoveMobileImage(true);
    if (mobileInputRef.current) mobileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("small_heading", form.small_heading);
      formData.append("main_heading_line1", form.main_heading_line1);
      formData.append("main_heading_line2", form.main_heading_line2);
      formData.append("primary_btn_text", form.primary_btn_text);
      formData.append("primary_btn_url", form.primary_btn_url);
      formData.append("secondary_btn_text", form.secondary_btn_text);
      formData.append("secondary_btn_url", form.secondary_btn_url);
      if (desktopImageFile) formData.append("desktop_image", desktopImageFile);
      if (mobileImageFile) formData.append("mobile_image", mobileImageFile);
      if (removeMobileImage) formData.append("remove_mobile_image", "true");

      const updated = await saveAdminHeroBanner(formData);
      setForm(updated);
      // Reset file states after successful save
      setDesktopImageFile(null);
      setDesktopImagePreview(null);
      setMobileImageFile(null);
      setMobileImagePreview(null);
      setRemoveMobileImage(false);
      if (desktopInputRef.current) desktopInputRef.current.value = "";
      if (mobileInputRef.current) mobileInputRef.current.value = "";

      toast({ title: "Hero Banner saved", description: "Your changes are now live on the homepage." });
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err?.response?.data?.message ?? err?.message ?? "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentDesktopImage = desktopImagePreview ?? form.desktop_image_path;
  const currentMobileImage = removeMobileImage
    ? null
    : mobileImagePreview ?? form.mobile_image_path;

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-muted-foreground animate-pulse">Loading hero banner…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Hero Banner</h1>
          <p className="text-sm text-muted-foreground">
            Manage the homepage hero banner content and images
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* ── Left: Form ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Content */}
            <div className="bg-card p-8 space-y-6">
              <h2 className="font-serif text-xl">Banner Content</h2>

              {/* Collection Label */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/80 mb-2">
                  Collection Label
                </label>
                <input
                  type="text"
                  value={form.small_heading}
                  onChange={(e) => handleChange("small_heading", e.target.value)}
                  placeholder="e.g. Spring / Summer 2025"
                  className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                  data-testid="input-hero-small-heading"
                />
              </div>

              {/* Main Heading */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/80 mb-2">
                  Main Heading — Line 1
                </label>
                <input
                  type="text"
                  value={form.main_heading_line1}
                  onChange={(e) => handleChange("main_heading_line1", e.target.value)}
                  placeholder="e.g. The Art of"
                  className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                  data-testid="input-hero-heading-line1"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/80 mb-2">
                  Main Heading — Line 2
                </label>
                <input
                  type="text"
                  value={form.main_heading_line2}
                  onChange={(e) => handleChange("main_heading_line2", e.target.value)}
                  placeholder="e.g. Unhurried Style"
                  className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                  data-testid="input-hero-heading-line2"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-border/20 pt-2">
                <p className="text-[10px] uppercase tracking-widest text-foreground/80 mb-4">
                  Primary Button
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-foreground/80 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={form.primary_btn_text}
                      onChange={(e) => handleChange("primary_btn_text", e.target.value)}
                      placeholder="e.g. Discover Collection"
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                      data-testid="input-hero-primary-btn-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-foreground/80 mb-2">
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={form.primary_btn_url}
                      onChange={(e) => handleChange("primary_btn_url", e.target.value)}
                      placeholder="e.g. /shop"
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                      data-testid="input-hero-primary-btn-url"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/20 pt-2">
                <p className="text-[10px] uppercase tracking-widest text-foreground/80 mb-4">
                  Secondary Button
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={form.secondary_btn_text}
                      onChange={(e) => handleChange("secondary_btn_text", e.target.value)}
                      placeholder="e.g. Limited Edition"
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                      data-testid="input-hero-secondary-btn-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={form.secondary_btn_url}
                      onChange={(e) => handleChange("secondary_btn_url", e.target.value)}
                      placeholder="e.g. /shop?collection=limited-edition"
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/30"
                      data-testid="input-hero-secondary-btn-url"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-card p-8 space-y-8">
              <div>
                <h2 className="font-serif text-xl mb-1">Banner Images</h2>
                <p className="text-xs text-foreground/75">
                  Desktop image is always shown. Mobile image is shown on small screens — falls back to desktop image if not set.
                </p>
              </div>

              {/* Desktop Image */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-foreground/70" strokeWidth={1.5} />
                  <label className="text-[10px] uppercase tracking-widest text-foreground/80">
                    Desktop Banner Image <span className="text-accent">*</span>
                  </label>
                </div>
                {currentDesktopImage && (
                  <div className="relative mb-3 overflow-hidden border border-border/30">
                    <img
                      src={currentDesktopImage}
                      alt="Desktop banner preview"
                      className="w-full h-48 object-cover object-top"
                    />
                    {desktopImageFile && (
                      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5">
                        New — unsaved
                      </span>
                    )}
                  </div>
                )}
                <input
                  ref={desktopInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDesktopImageChange}
                  id="desktop-image-input"
                  data-testid="input-hero-desktop-image"
                />
                <label
                  htmlFor="desktop-image-input"
                  className="inline-flex items-center gap-2 border border-border/40 px-4 py-2.5 text-xs uppercase tracking-widest cursor-pointer hover:border-foreground hover:text-foreground transition-colors text-foreground"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {currentDesktopImage ? "Replace Image" : "Upload Image"}
                </label>
              </div>

              {/* Mobile Image */}
              <div className="border-t border-border/20 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                  <label className="text-[10px] uppercase tracking-widest text-foreground">
                    Mobile Banner Image{" "}
                    <span className="text-foreground">(Optional)</span>
                  </label>
                </div>
                <p className="text-[11px] text-foreground mb-3">
                  If not set, the desktop image is used on mobile automatically.
                </p>
                {currentMobileImage ? (
                  <div className="relative mb-3 overflow-hidden border border-border/30">
                    <img
                      src={currentMobileImage}
                      alt="Mobile banner preview"
                      className="w-full h-48 object-cover object-top"
                    />
                    {mobileImageFile && (
                      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5">
                        New — unsaved
                      </span>
                    )}
                    <button
                      onClick={handleRemoveMobileImage}
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground p-1.5 transition-colors"
                      title="Remove mobile image"
                      data-testid="btn-remove-mobile-image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 border border-dashed border-border/50 flex flex-col items-center justify-center mb-3 text-foreground">
                    <Smartphone className="w-6 h-6 mb-2" strokeWidth={1} />
                    <p className="text-[10px] uppercase tracking-widest">
                      {removeMobileImage ? "Will be removed on save" : "No mobile image — using desktop"}
                    </p>
                  </div>
                )}
                <input
                  ref={mobileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMobileImageChange}
                  id="mobile-image-input"
                  data-testid="input-hero-mobile-image"
                />
                <label
                  htmlFor="mobile-image-input"
                  className="inline-flex items-center gap-2 border border-border/40 px-4 py-2.5 text-xs uppercase tracking-widest cursor-pointer hover:border-foreground hover:text-foreground transition-colors text-foreground"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {currentMobileImage ? "Replace Image" : "Upload Mobile Image"}
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-testid="button-save-hero-banner"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {(desktopImageFile || mobileImageFile || removeMobileImage) && (
                <p className="text-xs text-foreground/70">
                  You have unsaved image changes
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Live Preview Panel ── */}
          <div className="xl:col-span-1">
            <div className="bg-card p-6 sticky top-8">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Content Preview
              </p>
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "9/16", maxHeight: "420px" }}
              >
                <img
                  src={currentDesktopImage || ""}
                  alt="Hero banner preview"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-background/25" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-center px-4">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/80 mb-3">
                    {form.small_heading || "Collection Label"}
                  </p>
                  <h3 className="font-serif text-2xl leading-none mb-4 text-white">
                    {form.main_heading_line1 || "Line 1"}
                    <br />
                    <em>{form.main_heading_line2 || "Line 2"}</em>
                  </h3>
                  <div className="flex flex-col gap-2 w-full px-2">
                    <div className="bg-white/90 text-black px-4 py-2 text-[9px] uppercase tracking-widest text-center truncate">
                      {form.primary_btn_text || "Primary Button"}
                    </div>
                    <div className="border border-white/60 text-white px-4 py-2 text-[9px] uppercase tracking-widest text-center truncate">
                      {form.secondary_btn_text || "Secondary Button"}
                    </div>
                  </div>
                </div>
              </div>
              {currentMobileImage && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Mobile Image Preview
                  </p>
                  <div className="relative overflow-hidden border border-border/20" style={{ aspectRatio: "9/16", maxHeight: "200px" }}>
                    <img
                      src={currentMobileImage}
                      alt="Mobile preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState, useEffect, ChangeEvent } from "react";
import { useSearch } from "wouter";
import { AdminLayout } from "./AdminLayout";
import { toast } from "@/hooks/use-toast";
import {
  fetchAdminHomepageSections,
  updateAdminHomepageSection,
  uploadHomepageImage,
  HomepageSectionsMap,
} from "@/lib/homepageSectionsApi";
import { Save, Upload, Trash2, RefreshCw, Image as ImageIcon } from "lucide-react";

const SECTION_TITLES: Record<string, { name: string; desc: string }> = {
  tagline: {
    name: "Tagline Banner Settings",
    desc: "Manage the hero tagline banner displayed directly below the main hero image.",
  },
  featured_collections: {
    name: "Featured Collections Settings",
    desc: "Manage titles, collection labels, filter slugs, and cover images for the 4 featured collections.",
  },
  limited_edition_banner: {
    name: "Limited Edition Banner Settings",
    desc: "Manage title, subtitle, CTA button, and background image for the full-width promo banner.",
  },
  our_story: {
    name: "Our Story Section Settings",
    desc: "Manage title, story narrative, and call-to-action link.",
  },
  why_jatelier: {
    name: "Why Choose Us Settings",
    desc: "Manage the title, subtitle, and 3 value proposition cards.",
  },
  newsletter: {
    name: "Newsletter Section Settings",
    desc: "Manage newsletter header, description, input placeholder, and submit button label.",
  },
};

export default function AdminHomepageSections() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const tabParam = searchParams.get("tab") || "tagline";

  const [activeTab, setActiveTab] = useState<
    "tagline" | "featured_collections" | "limited_edition_banner" | "our_story" | "why_jatelier" | "newsletter"
  >((tabParam as any) || "tagline");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states for sections
  const [sections, setSections] = useState<HomepageSectionsMap>({});

  const loadSections = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminHomepageSections();
      setSections(data);
    } catch (err: any) {
      toast({
        title: "Failed to load homepage sections",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleSaveSection = async (sectionKey: string) => {
    const section = sections[sectionKey];
    if (!section) return;

    setSaving(true);
    try {
      await updateAdminHomepageSection({
        section_key: sectionKey,
        title: section.title,
        subtitle: section.subtitle,
        content: section.content,
        is_enabled: section.is_enabled,
      });
      toast({ title: "Section saved successfully!" });
      loadSections();
    } catch (err: any) {
      toast({
        title: "Failed to save section",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadHomepageImage(file);
      callback(url);
      toast({ title: "Image uploaded successfully!" });
    } catch (err: any) {
      toast({
        title: "Image upload failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Helper for field mutations
  const updateSectionField = (key: string, field: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const updateContentField = (key: string, contentPath: string, value: any) => {
    setSections((prev) => {
      const currentSection = prev[key] || { section_key: key, title: "", subtitle: "", content: {}, is_enabled: true };
      return {
        ...prev,
        [key]: {
          ...currentSection,
          content: {
            ...currentSection.content,
            [contentPath]: value,
          },
        },
      };
    });
  };

  const currentInfo = SECTION_TITLES[activeTab] || {
    name: "Homepage Section Settings",
    desc: "Manage copy, headings, and images for this section.",
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">{currentInfo.name}</h1>
          <p className="text-sm text-muted-foreground">{currentInfo.desc}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading section settings...</div>
        ) : (
          <div className="bg-card p-8 border border-border/40 max-w-4xl space-y-8">
            {/* Section Enable Toggle */}
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div>
                <h2 className="font-serif text-xl capitalize">{activeTab.replace(/_/g, " ")}</h2>
                <p className="text-xs text-muted-foreground">Enable or disable this section on the live homepage.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections[activeTab]?.is_enabled ?? true}
                  onChange={(e) => updateSectionField(activeTab, "is_enabled", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs uppercase tracking-wider font-medium">
                  {sections[activeTab]?.is_enabled !== false ? "Visible on Homepage" : "Hidden"}
                </span>
              </label>
            </div>

            {/* --- 1. TAGLINE BANNER --- */}
            {activeTab === "tagline" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Tagline Line 1
                  </label>
                  <input
                    type="text"
                    value={sections['tagline']?.content?.line1 ?? ""}
                    onChange={(e) => updateContentField('tagline', 'line1', e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    placeholder="Designed for Everyday Comfort."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Tagline Line 2
                  </label>
                  <input
                    type="text"
                    value={sections['tagline']?.content?.line2 ?? ""}
                    onChange={(e) => updateContentField('tagline', 'line2', e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    placeholder="Crafted for Timeless Style."
                  />
                </div>
              </div>
            )}

            {/* --- 2. FEATURED COLLECTIONS --- */}
            {activeTab === "featured_collections" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={sections['featured_collections']?.subtitle ?? ""}
                      onChange={(e) => updateSectionField('featured_collections', 'subtitle', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sections['featured_collections']?.title ?? ""}
                      onChange={(e) => updateSectionField('featured_collections', 'title', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Collection Cards (4 Items)</p>
                  <div className="space-y-4">
                    {(sections['featured_collections']?.content?.items ?? []).map((col: any, index: number) => (
                      <div key={index} className="border border-border/30 p-5 space-y-4 bg-muted/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                              Collection Label
                            </label>
                            <input
                              type="text"
                              value={col.label}
                              onChange={(e) => {
                                const newItems = [...(sections['featured_collections']?.content?.items ?? [])];
                                newItems[index].label = e.target.value;
                                updateContentField('featured_collections', 'items', newItems);
                              }}
                              className="w-full bg-background border border-border px-3 py-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                              Collection Slug (Filter)
                            </label>
                            <input
                              type="text"
                              value={col.slug}
                              onChange={(e) => {
                                const newItems = [...(sections['featured_collections']?.content?.items ?? [])];
                                newItems[index].slug = e.target.value;
                                updateContentField('featured_collections', 'items', newItems);
                              }}
                              className="w-full bg-background border border-border px-3 py-2 text-xs"
                            />
                          </div>
                        </div>

                        {/* Image Management */}
                        <div>
                          <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
                            Collection Cover Image
                          </label>
                          
                          {col.image ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background p-3 border border-border">
                              <img
                                src={col.image}
                                alt={col.label}
                                className="w-20 h-24 object-cover border border-border flex-shrink-0"
                              />
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-foreground truncate max-w-xs">{col.image}</p>
                                <div className="flex flex-wrap gap-2">
                                  <label className="cursor-pointer bg-primary text-primary-foreground px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                                    <RefreshCw className="w-3 h-3" /> Replace Image
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleImageUpload(e, (url) => {
                                          const newItems = [...(sections['featured_collections']?.content?.items ?? [])];
                                          newItems[index].image = url;
                                          updateContentField('featured_collections', 'items', newItems);
                                        })
                                      }
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...(sections['featured_collections']?.content?.items ?? [])];
                                      newItems[index].image = "";
                                      updateContentField('featured_collections', 'items', newItems);
                                    }}
                                    className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove Image
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer border-2 border-dashed border-border/60 hover:border-accent p-6 flex flex-col items-center justify-center gap-2 bg-background transition-colors w-full">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Upload Image from Computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(e, (url) => {
                                    const newItems = [...(sections['featured_collections']?.content?.items ?? [])];
                                    newItems[index].image = url;
                                    updateContentField('featured_collections', 'items', newItems);
                                  })
                                }
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- 3. LIMITED EDITION BANNER --- */}
            {activeTab === "limited_edition_banner" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Banner Subtitle
                    </label>
                    <input
                      type="text"
                      value={sections['limited_edition_banner']?.subtitle ?? ""}
                      onChange={(e) => updateSectionField('limited_edition_banner', 'subtitle', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Banner Title
                    </label>
                    <input
                      type="text"
                      value={sections['limited_edition_banner']?.title ?? ""}
                      onChange={(e) => updateSectionField('limited_edition_banner', 'title', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={sections['limited_edition_banner']?.content?.btn_text ?? ""}
                      onChange={(e) => updateContentField('limited_edition_banner', 'btn_text', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Button Link (URL)
                    </label>
                    <input
                      type="text"
                      value={sections['limited_edition_banner']?.content?.btn_url ?? ""}
                      onChange={(e) => updateContentField('limited_edition_banner', 'btn_url', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Banner Background Image
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={sections['limited_edition_banner']?.content?.image_path ?? ""}
                      onChange={(e) => updateContentField('limited_edition_banner', 'image_path', e.target.value)}
                      className="flex-1 bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                    <label className="cursor-pointer bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, (url) => updateContentField('limited_edition_banner', 'image_path', url))
                        }
                      />
                    </label>
                  </div>
                  {sections['limited_edition_banner']?.content?.image_path && (
                    <img
                      src={sections['limited_edition_banner']?.content?.image_path}
                      alt="Banner Preview"
                      className="mt-4 w-full h-40 object-cover border border-border"
                    />
                  )}
                </div>
              </div>
            )}

            {/* --- 4. OUR STORY --- */}
            {activeTab === "our_story" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={sections['our_story']?.subtitle ?? ""}
                    onChange={(e) => updateSectionField('our_story', 'subtitle', e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Main Heading (Use line break for line 2)
                  </label>
                  <textarea
                    rows={2}
                    value={sections['our_story']?.title ?? ""}
                    onChange={(e) => updateSectionField('our_story', 'title', e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Story Body Copy
                  </label>
                  <textarea
                    rows={5}
                    value={sections['our_story']?.content?.body ?? ""}
                    onChange={(e) => updateContentField('our_story', 'body', e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={sections['our_story']?.content?.btn_text ?? ""}
                      onChange={(e) => updateContentField('our_story', 'btn_text', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      CTA Button Link (URL)
                    </label>
                    <input
                      type="text"
                      value={sections['our_story']?.content?.btn_url ?? ""}
                      onChange={(e) => updateContentField('our_story', 'btn_url', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 5. WHY J ATELIER --- */}
            {activeTab === "why_jatelier" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={sections['why_jatelier']?.subtitle ?? ""}
                      onChange={(e) => updateSectionField('why_jatelier', 'subtitle', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sections['why_jatelier']?.title ?? ""}
                      onChange={(e) => updateSectionField('why_jatelier', 'title', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Value Proposition Cards (3 Items)</p>
                  <div className="space-y-4">
                    {(sections['why_jatelier']?.content?.items ?? []).map((card: any, index: number) => (
                      <div key={index} className="border border-border/30 p-4 space-y-3 bg-muted/10">
                        <div>
                          <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                            Card Title #{index + 1}
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const newItems = [...(sections['why_jatelier']?.content?.items ?? [])];
                              newItems[index].title = e.target.value;
                              updateContentField('why_jatelier', 'items', newItems);
                            }}
                            className="w-full bg-background border border-border px-3 py-1.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                            Card Description Body
                          </label>
                          <textarea
                            rows={3}
                            value={card.body}
                            onChange={(e) => {
                              const newItems = [...(sections['why_jatelier']?.content?.items ?? [])];
                              newItems[index].body = e.target.value;
                              updateContentField('why_jatelier', 'items', newItems);
                            }}
                            className="w-full bg-background border border-border px-3 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- 6. NEWSLETTER --- */}
            {activeTab === "newsletter" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={sections['newsletter']?.subtitle ?? ""}
                      onChange={(e) => updateSectionField('newsletter', 'subtitle', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sections['newsletter']?.title ?? ""}
                      onChange={(e) => updateSectionField('newsletter', 'title', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Section Description
                  </label>
                  <textarea
                    rows={3}
                    value={sections['newsletter']?.content?.description ?? ""}
                    onChange={(e) => updateContentField('newsletter', 'description', e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Input Field Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={sections['newsletter']?.content?.input_placeholder ?? ""}
                      onChange={(e) => updateContentField('newsletter', 'input_placeholder', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Subscribe Button Label
                    </label>
                    <input
                      type="text"
                      value={sections['newsletter']?.content?.btn_text ?? ""}
                      onChange={(e) => updateContentField('newsletter', 'btn_text', e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="border-t border-border/20 pt-6">
              <button
                onClick={() => handleSaveSection(activeTab)}
                disabled={saving || uploading}
                className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving Changes..." : `Save ${currentInfo.name.replace(" Settings", "")}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { toast } from "@/hooks/use-toast";
import {
  fetchAdminNavigation,
  createHeaderNavItem,
  updateHeaderNavItem,
  deleteHeaderNavItem,
  createFooterSection,
  updateFooterSection,
  deleteFooterSection,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  updateFooterSettings,
  HeaderNavItem,
  FooterSectionItem,
  FooterLinkItem,
} from "@/lib/navigationApi";
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminNavigation() {
  const [tab, setTab] = useState<"header" | "footer_content" | "footer_sections" | "legal_links">("header");
  const [loading, setLoading] = useState(true);

  // Data states
  const [headerItems, setHeaderItems] = useState<HeaderNavItem[]>([]);
  const [footerBrandName, setFooterBrandName] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [footerSections, setFooterSections] = useState<FooterSectionItem[]>([]);
  const [legalLinks, setLegalLinks] = useState<FooterLinkItem[]>([]);

  // Editing state for Header Items
  const [newHeaderLabel, setNewHeaderLabel] = useState("");
  const [newHeaderUrl, setNewHeaderUrl] = useState("");
  const [editingHeaderId, setEditingHeaderId] = useState<number | null>(null);
  const [editHeaderLabel, setEditHeaderLabel] = useState("");
  const [editHeaderUrl, setEditHeaderUrl] = useState("");

  // Editing state for Footer Settings
  const [savingFooterSettings, setSavingFooterSettings] = useState(false);

  // Editing state for Footer Sections
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");

  // Editing state for Section Links
  const [selectedSectionForNewLink, setSelectedSectionForNewLink] = useState<number | null>(null);
  const [newSectionLinkLabel, setNewSectionLinkLabel] = useState("");
  const [newSectionLinkUrl, setNewSectionLinkUrl] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [editLinkLabel, setEditLinkLabel] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");

  // Editing state for Legal Links
  const [newLegalLabel, setNewLegalLabel] = useState("");
  const [newLegalUrl, setNewLegalUrl] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNavigation();
      setHeaderItems(data.header_items || []);
      setFooterBrandName(data.footer_brand_name || "J ATELIER");
      setFooterDescription(data.footer_description || "");
      setCopyrightText(data.copyright_text || "");
      setFooterSections(data.footer_sections || []);
      setLegalLinks(data.legal_links || []);
    } catch (err: any) {
      toast({
        title: "Error loading navigation data",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* --- Header Link Actions --- */
  const handleAddHeaderItem = async () => {
    if (!newHeaderLabel.trim() || !newHeaderUrl.trim()) {
      toast({ title: "Please fill in label and URL", variant: "destructive" });
      return;
    }
    try {
      const nextSort = headerItems.length > 0 ? Math.max(...headerItems.map(i => i.sort_order)) + 1 : 1;
      await createHeaderNavItem({
        label: newHeaderLabel,
        url: newHeaderUrl,
        sort_order: nextSort,
        is_enabled: true,
      });
      setNewHeaderLabel("");
      setNewHeaderUrl("");
      toast({ title: "Header link added" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed to add header link", variant: "destructive" });
    }
  };

  const handleToggleHeaderItem = async (item: HeaderNavItem) => {
    try {
      await updateHeaderNavItem(item.id, { is_enabled: !item.is_enabled });
      toast({ title: item.is_enabled ? "Link disabled" : "Link enabled" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to update link status", variant: "destructive" });
    }
  };

  const handleSaveHeaderEdit = async (id: number) => {
    try {
      await updateHeaderNavItem(id, { label: editHeaderLabel, url: editHeaderUrl });
      setEditingHeaderId(null);
      toast({ title: "Header link updated" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to update link", variant: "destructive" });
    }
  };

  const handleDeleteHeaderItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this navigation link?")) return;
    try {
      await deleteHeaderNavItem(id);
      toast({ title: "Header link deleted" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to delete link", variant: "destructive" });
    }
  };

  /* --- Footer Content Settings Actions --- */
  const handleSaveFooterSettings = async () => {
    setSavingFooterSettings(true);
    try {
      await updateFooterSettings({
        footer_brand_name: footerBrandName,
        footer_description: footerDescription,
        copyright_text: copyrightText,
      });
      toast({ title: "Footer settings saved successfully" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed to save footer settings", variant: "destructive" });
    } finally {
      setSavingFooterSettings(false);
    }
  };

  /* --- Footer Section Actions --- */
  const handleAddFooterSection = async () => {
    if (!newSectionTitle.trim()) {
      toast({ title: "Please enter a section title", variant: "destructive" });
      return;
    }
    try {
      const nextSort = footerSections.length > 0 ? Math.max(...footerSections.map(s => s.sort_order)) + 1 : 1;
      await createFooterSection({ title: newSectionTitle, sort_order: nextSort, is_enabled: true });
      setNewSectionTitle("");
      toast({ title: "Footer section created" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to create footer section", variant: "destructive" });
    }
  };

  const handleToggleFooterSection = async (section: FooterSectionItem) => {
    try {
      await updateFooterSection(section.id, { is_enabled: !section.is_enabled });
      toast({ title: section.is_enabled ? "Section disabled" : "Section enabled" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to update section status", variant: "destructive" });
    }
  };

  const handleSaveSectionEdit = async (id: number) => {
    try {
      await updateFooterSection(id, { title: editSectionTitle });
      setEditingSectionId(null);
      toast({ title: "Section updated" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to update section", variant: "destructive" });
    }
  };

  const handleDeleteFooterSection = async (id: number) => {
    if (!confirm("Are you sure? This will delete the section and all its links.")) return;
    try {
      await deleteFooterSection(id);
      toast({ title: "Footer section deleted" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to delete footer section", variant: "destructive" });
    }
  };

  /* --- Footer Links Actions --- */
  const handleAddFooterLink = async (sectionId: number | null, type: "section_link" | "legal_link") => {
    const label = type === "legal_link" ? newLegalLabel : newSectionLinkLabel;
    const url = type === "legal_link" ? newLegalUrl : newSectionLinkUrl;

    if (!label.trim() || !url.trim()) {
      toast({ title: "Please fill in both label and URL", variant: "destructive" });
      return;
    }

    try {
      await createFooterLink({
        footer_section_id: sectionId,
        label,
        url,
        type,
        is_enabled: true,
        sort_order: 99,
      });

      if (type === "legal_link") {
        setNewLegalLabel("");
        setNewLegalUrl("");
      } else {
        setNewSectionLinkLabel("");
        setNewSectionLinkUrl("");
        setSelectedSectionForNewLink(null);
      }
      toast({ title: "Footer link added" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to add footer link", variant: "destructive" });
    }
  };

  const handleToggleFooterLink = async (link: FooterLinkItem) => {
    try {
      await updateFooterLink(link.id, { is_enabled: !link.is_enabled });
      toast({ title: link.is_enabled ? "Link disabled" : "Link enabled" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to update link status", variant: "destructive" });
    }
  };

  const handleSaveLinkEdit = async (id: number) => {
    try {
      await updateFooterLink(id, { label: editLinkLabel, url: editLinkUrl });
      setEditingLinkId(null);
      toast({ title: "Footer link updated" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to update footer link", variant: "destructive" });
    }
  };

  const handleDeleteFooterLink = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteFooterLink(id);
      toast({ title: "Footer link deleted" });
      loadData();
    } catch (err) {
      toast({ title: "Failed to delete link", variant: "destructive" });
    }
  };

  const tabs = [
    { id: "header", label: "Header Menu Items" },
    { id: "footer_content", label: "Footer Content & Brand" },
    { id: "footer_sections", label: "Footer Link Sections" },
    { id: "legal_links", label: "Footer Legal Links" },
  ] as const;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Navbar & Footer Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store header navigation, footer brand text, link columns, and legal policy links.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border/20">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-nav-${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading navigation settings...</div>
        ) : (
          <>
            {/* --- TAB 1: HEADER MENU ITEMS --- */}
            {tab === "header" && (
              <div className="space-y-8 max-w-4xl">
                {/* Add Header Link Form */}
                <div className="bg-card p-6 border border-border/40">
                  <h2 className="font-serif text-lg mb-4">Add Header Navigation Item</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        Menu Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shop All"
                        value={newHeaderLabel}
                        onChange={(e) => setNewHeaderLabel(e.target.value)}
                        className="w-full bg-transparent border border-border/40 px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        URL / Path
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /shop"
                        value={newHeaderUrl}
                        onChange={(e) => setNewHeaderUrl(e.target.value)}
                        className="w-full bg-transparent border border-border/40 px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddHeaderItem}
                        className="w-full bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                  </div>
                </div>

                {/* Header Items Table */}
                <div className="bg-card border border-border/40 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/30">
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">Order</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">Label</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">URL</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headerItems.map((item, index) => (
                        <tr key={item.id} className="border-b border-border/10 hover:bg-muted/10">
                          <td className="p-4 text-xs font-mono">{index + 1}</td>
                          <td className="p-4 text-sm font-medium">
                            {editingHeaderId === item.id ? (
                              <input
                                type="text"
                                value={editHeaderLabel}
                                onChange={(e) => setEditHeaderLabel(e.target.value)}
                                className="bg-background border border-border px-2 py-1 text-sm"
                              />
                            ) : (
                              item.label
                            )}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground font-mono">
                            {editingHeaderId === item.id ? (
                              <input
                                type="text"
                                value={editHeaderUrl}
                                onChange={(e) => setEditHeaderUrl(e.target.value)}
                                className="bg-background border border-border px-2 py-1 text-sm"
                              />
                            ) : (
                              item.url
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleHeaderItem(item)}
                              className={`text-[10px] uppercase tracking-wider px-2 py-1 border transition-colors ${
                                item.is_enabled
                                  ? "bg-accent/10 border-accent/30 text-accent"
                                  : "bg-muted border-border/40 text-muted-foreground"
                              }`}
                            >
                              {item.is_enabled ? "Enabled" : "Disabled"}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            {editingHeaderId === item.id ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleSaveHeaderEdit(item.id)}
                                  className="p-1 hover:text-accent"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingHeaderId(null)}
                                  className="p-1 hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingHeaderId(item.id);
                                    setEditHeaderLabel(item.label);
                                    setEditHeaderUrl(item.url);
                                  }}
                                  className="p-1 hover:text-accent"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHeaderItem(item.id)}
                                  className="p-1 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- TAB 2: FOOTER CONTENT & BRAND --- */}
            {tab === "footer_content" && (
              <div className="bg-card p-8 border border-border/40 max-w-2xl space-y-6">
                <h2 className="font-serif text-xl mb-4">Footer Information & Copy</h2>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Footer Brand Name
                  </label>
                  <input
                    type="text"
                    value={footerBrandName}
                    onChange={(e) => setFooterBrandName(e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Displayed as the main heading in the footer.</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Footer Description / Brand Tagline
                  </label>
                  <textarea
                    rows={4}
                    value={footerDescription}
                    onChange={(e) => setFooterDescription(e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Use <code className="bg-muted px-1">{"{year}"}</code> to dynamically render the current year.</p>
                </div>

                <button
                  onClick={handleSaveFooterSettings}
                  disabled={savingFooterSettings}
                  className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {savingFooterSettings ? "Saving..." : "Save Footer Copy"}
                </button>
              </div>
            )}

            {/* --- TAB 3: FOOTER LINK SECTIONS --- */}
            {tab === "footer_sections" && (
              <div className="space-y-8 max-w-4xl">
                {/* Add Section Form */}
                <div className="bg-card p-6 border border-border/40 flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      New Footer Column Section Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shop, Support, Studio"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="w-full bg-transparent border border-border/40 px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    onClick={handleAddFooterSection}
                    className="bg-primary text-primary-foreground px-6 py-2 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>

                {/* Sections & Nested Links */}
                <div className="space-y-6">
                  {footerSections.map((section) => (
                    <div key={section.id} className="bg-card border border-border/40 p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-border/20 pb-4">
                        <div className="flex items-center gap-3">
                          {editingSectionId === section.id ? (
                            <input
                              type="text"
                              value={editSectionTitle}
                              onChange={(e) => setEditSectionTitle(e.target.value)}
                              className="bg-background border border-border px-2 py-1 text-sm"
                            />
                          ) : (
                            <h3 className="font-serif text-lg">{section.title}</h3>
                          )}
                          <button
                            onClick={() => handleToggleFooterSection(section)}
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                              section.is_enabled ? "bg-accent/10 border-accent/30 text-accent" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {section.is_enabled ? "Active" : "Disabled"}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingSectionId === section.id ? (
                            <>
                              <button onClick={() => handleSaveSectionEdit(section.id)} className="p-1 hover:text-accent">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingSectionId(null)} className="p-1 hover:text-destructive">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingSectionId(section.id);
                                  setEditSectionTitle(section.title);
                                }}
                                className="p-1 hover:text-accent"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteFooterSection(section.id)} className="p-1 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Links under this section */}
                      <div className="space-y-2 pl-4">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Column Links</p>
                        {section.links && section.links.length > 0 ? (
                          section.links.map((link) => (
                            <div key={link.id} className="flex items-center justify-between bg-muted/20 p-2 text-sm border border-border/20">
                              <div className="flex items-center gap-3">
                                {editingLinkId === link.id ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editLinkLabel}
                                      onChange={(e) => setEditLinkLabel(e.target.value)}
                                      className="bg-background border border-border px-2 py-1 text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={editLinkUrl}
                                      onChange={(e) => setEditLinkUrl(e.target.value)}
                                      className="bg-background border border-border px-2 py-1 text-xs"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-medium">{link.label}</span>
                                    <span className="text-xs text-muted-foreground font-mono">({link.url})</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleFooterLink(link)}
                                  className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                                    link.is_enabled ? "text-accent border-accent/30" : "text-muted-foreground border-border"
                                  }`}
                                >
                                  {link.is_enabled ? "Enabled" : "Disabled"}
                                </button>
                                {editingLinkId === link.id ? (
                                  <>
                                    <button onClick={() => handleSaveLinkEdit(link.id)} className="p-1 hover:text-accent">
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditingLinkId(null)} className="p-1 hover:text-destructive">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingLinkId(link.id);
                                        setEditLinkLabel(link.label);
                                        setEditLinkUrl(link.url);
                                      }}
                                      className="p-1 hover:text-accent"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteFooterLink(link.id)} className="p-1 hover:text-destructive">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No links in this section yet.</p>
                        )}

                        {/* Add link form for section */}
                        {selectedSectionForNewLink === section.id ? (
                          <div className="flex gap-2 pt-2 border-t border-border/20 mt-2">
                            <input
                              type="text"
                              placeholder="Link Label (e.g. All Products)"
                              value={newSectionLinkLabel}
                              onChange={(e) => setNewSectionLinkLabel(e.target.value)}
                              className="bg-background border border-border/40 px-3 py-1.5 text-xs flex-1"
                            />
                            <input
                              type="text"
                              placeholder="URL (e.g. /shop)"
                              value={newSectionLinkUrl}
                              onChange={(e) => setNewSectionLinkUrl(e.target.value)}
                              className="bg-background border border-border/40 px-3 py-1.5 text-xs flex-1"
                            />
                            <button
                              onClick={() => handleAddFooterLink(section.id, "section_link")}
                              className="bg-primary text-primary-foreground px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-primary/90"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setSelectedSectionForNewLink(null)}
                              className="px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedSectionForNewLink(section.id)}
                            className="mt-2 text-xs text-accent hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Link to {section.title}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB 4: LEGAL & POLICY LINKS --- */}
            {tab === "legal_links" && (
              <div className="space-y-8 max-w-4xl">
                {/* Add Legal Link Form */}
                <div className="bg-card p-6 border border-border/40">
                  <h2 className="font-serif text-lg mb-4">Add Footer Bottom Legal Link</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        Link Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Privacy Policy"
                        value={newLegalLabel}
                        onChange={(e) => setNewLegalLabel(e.target.value)}
                        className="w-full bg-transparent border border-border/40 px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        URL / Path
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /privacy"
                        value={newLegalUrl}
                        onChange={(e) => setNewLegalUrl(e.target.value)}
                        className="w-full bg-transparent border border-border/40 px-3 py-2 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleAddFooterLink(null, "legal_link")}
                        className="w-full bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Legal Link
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legal Links List */}
                <div className="bg-card border border-border/40 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/30">
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">Order</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">Label</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">URL</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legalLinks.map((link, index) => (
                        <tr key={link.id} className="border-b border-border/10 hover:bg-muted/10">
                          <td className="p-4 text-xs font-mono">{index + 1}</td>
                          <td className="p-4 text-sm font-medium">
                            {editingLinkId === link.id ? (
                              <input
                                type="text"
                                value={editLinkLabel}
                                onChange={(e) => setEditLinkLabel(e.target.value)}
                                className="bg-background border border-border px-2 py-1 text-sm"
                              />
                            ) : (
                              link.label
                            )}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground font-mono">
                            {editingLinkId === link.id ? (
                              <input
                                type="text"
                                value={editLinkUrl}
                                onChange={(e) => setEditLinkUrl(e.target.value)}
                                className="bg-background border border-border px-2 py-1 text-sm"
                              />
                            ) : (
                              link.url
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleFooterLink(link)}
                              className={`text-[10px] uppercase tracking-wider px-2 py-1 border transition-colors ${
                                link.is_enabled
                                  ? "bg-accent/10 border-accent/30 text-accent"
                                  : "bg-muted border-border/40 text-muted-foreground"
                              }`}
                            >
                              {link.is_enabled ? "Enabled" : "Disabled"}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            {editingLinkId === link.id ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleSaveLinkEdit(link.id)} className="p-1 hover:text-accent">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingLinkId(null)} className="p-1 hover:text-destructive">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingLinkId(link.id);
                                    setEditLinkLabel(link.label);
                                    setEditLinkUrl(link.url);
                                  }}
                                  className="p-1 hover:text-accent"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteFooterLink(link.id)} className="p-1 hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

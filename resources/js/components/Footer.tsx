import { useEffect, useState } from "react";
import { Link } from "wouter";
import { fetchPublicNavigation, FooterSectionItem, FooterLinkItem } from "@/lib/navigationApi";

const DEFAULT_BRAND_NAME = "J ATELIER";
const DEFAULT_DESCRIPTION = "Designed for Everyday Comfort. Crafted for Timeless Style. Elevating your everyday wardrobe with intentional pieces.";
const DEFAULT_COPYRIGHT = `© ${new Date().getFullYear()} J Atelier. All rights reserved.`;

const DEFAULT_SECTIONS: FooterSectionItem[] = [
  {
    id: 1,
    title: "Shop",
    sort_order: 1,
    is_enabled: true,
    links: [
      { id: 1, label: "All Products", url: "/shop", type: "section_link", sort_order: 1 },
      { id: 2, label: "New Arrivals", url: "/shop?collection=new-arrivals", type: "section_link", sort_order: 2 },
      { id: 3, label: "Best Sellers", url: "/shop?collection=best-sellers", type: "section_link", sort_order: 3 },
    ],
  },
  {
    id: 2,
    title: "Support",
    sort_order: 2,
    is_enabled: true,
    links: [
      { id: 4, label: "FAQ", url: "/faq", type: "section_link", sort_order: 1 },
      { id: 5, label: "Returns & Exchanges", url: "/returns", type: "section_link", sort_order: 2 },
      { id: 6, label: "Contact Us", url: "/contact", type: "section_link", sort_order: 3 },
    ],
  },
];

const DEFAULT_LEGAL_LINKS: FooterLinkItem[] = [
  { id: 7, label: "Privacy Policy", url: "/privacy", type: "legal_link", sort_order: 1 },
  { id: 8, label: "Terms of Service", url: "/terms", type: "legal_link", sort_order: 2 },
];

export function Footer() {
  const [brandName, setBrandName] = useState(DEFAULT_BRAND_NAME);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [copyrightText, setCopyrightText] = useState(DEFAULT_COPYRIGHT);
  const [sections, setSections] = useState<FooterSectionItem[]>(DEFAULT_SECTIONS);
  const [legalLinks, setLegalLinks] = useState<FooterLinkItem[]>(DEFAULT_LEGAL_LINKS);

  useEffect(() => {
    fetchPublicNavigation()
      .then((data) => {
        if (data.footer) {
          if (data.footer.brand_name) setBrandName(data.footer.brand_name);
          if (data.footer.description) setDescription(data.footer.description);
          if (data.footer.copyright_text) setCopyrightText(data.footer.copyright_text);
          if (data.footer.sections && data.footer.sections.length > 0) setSections(data.footer.sections);
          if (data.footer.legal_links && data.footer.legal_links.length > 0) setLegalLinks(data.footer.legal_links);
        }
      })
      .catch((err) => {
        console.error("Failed to load footer navigation:", err);
      });
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground py-20 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-serif text-2xl tracking-widest mb-6">{brandName}</h2>
          <p className="text-primary-foreground/70 max-w-sm mb-8 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        {sections.map((section) => (
          <div key={section.id}>
            <h3 className="text-sm uppercase tracking-widest font-semibold mb-6">{section.title}</h3>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              {section.links.map((link) => (
                <li key={link.id}>
                  <Link href={link.url} className="hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-primary-foreground/10 text-xs text-primary-foreground/50 flex flex-col md:flex-row justify-between items-center">
        <p>{copyrightText}</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          {legalLinks.map((link) => (
            <Link key={link.id} href={link.url} className="hover:text-primary-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

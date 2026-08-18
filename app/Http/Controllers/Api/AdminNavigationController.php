<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NavigationItem;
use App\Models\FooterSection;
use App\Models\FooterLink;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class AdminNavigationController extends Controller
{
    /**
     * Public Navigation API endpoint for frontend (Navbar & Footer).
     */
    public function publicIndex()
    {
        $headerItems = NavigationItem::where('is_enabled', true)
            ->orderBy('sort_order', 'asc')
            ->get(['id', 'label', 'url', 'sort_order']);

        $footerSections = FooterSection::where('is_enabled', true)
            ->orderBy('sort_order', 'asc')
            ->with(['links' => function ($query) {
                $query->where('is_enabled', true)->where('type', 'section_link')->orderBy('sort_order', 'asc');
            }])
            ->get();

        $legalLinks = FooterLink::where('is_enabled', true)
            ->where('type', 'legal_link')
            ->orderBy('sort_order', 'asc')
            ->get(['id', 'label', 'url', 'sort_order']);

        $storeName = StoreSetting::get('store_name', 'J Atelier');
        $footerBrand = StoreSetting::get('footer_brand_name', 'J ATELIER');
        $footerDescription = StoreSetting::get('footer_description', 'Designed for Everyday Comfort. Crafted for Timeless Style. Elevating your everyday wardrobe with intentional pieces.');
        $copyrightText = StoreSetting::get('copyright_text', '© {year} J Atelier. All rights reserved.');

        return response()->json([
            'brand_name' => $storeName,
            'header_items' => $headerItems,
            'footer' => [
                'brand_name' => $footerBrand,
                'description' => $footerDescription,
                'copyright_text' => str_replace('{year}', date('Y'), $copyrightText),
                'sections' => $footerSections,
                'legal_links' => $legalLinks,
            ]
        ]);
    }

    /**
     * Admin Navigation API endpoint to get all configuration (including disabled items).
     */
    public function adminIndex()
    {
        $headerItems = NavigationItem::orderBy('sort_order', 'asc')->get();
        $footerSections = FooterSection::orderBy('sort_order', 'asc')
            ->with(['links' => function ($query) {
                $query->orderBy('sort_order', 'asc');
            }])
            ->get();
        $legalLinks = FooterLink::where('type', 'legal_link')->orderBy('sort_order', 'asc')->get();

        $storeName = StoreSetting::get('store_name', 'J Atelier');
        $footerBrand = StoreSetting::get('footer_brand_name', 'J ATELIER');
        $footerDescription = StoreSetting::get('footer_description', 'Designed for Everyday Comfort. Crafted for Timeless Style. Elevating your everyday wardrobe with intentional pieces.');
        $copyrightText = StoreSetting::get('copyright_text', '© {year} J Atelier. All rights reserved.');

        return response()->json([
            'header_items' => $headerItems,
            'footer_brand_name' => $footerBrand,
            'footer_description' => $footerDescription,
            'copyright_text' => $copyrightText,
            'footer_sections' => $footerSections,
            'legal_links' => $legalLinks,
        ]);
    }

    /* --- Header Navigation Items CRUD --- */

    public function storeHeaderItem(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ]);

        $item = NavigationItem::create($validated);

        return response()->json(['message' => 'Navigation item created', 'item' => $item], 201);
    }

    public function updateHeaderItem(Request $request, NavigationItem $navigationItem)
    {
        $validated = $request->validate([
            'label' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|required|string|max:255',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ]);

        $navigationItem->update($validated);

        return response()->json(['message' => 'Navigation item updated', 'item' => $navigationItem]);
    }

    public function destroyHeaderItem(NavigationItem $navigationItem)
    {
        $navigationItem->delete();

        return response()->json(['message' => 'Navigation item deleted']);
    }

    /* --- Footer Sections CRUD --- */

    public function storeFooterSection(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ]);

        $section = FooterSection::create($validated);

        return response()->json(['message' => 'Footer section created', 'section' => $section], 201);
    }

    public function updateFooterSection(Request $request, FooterSection $footerSection)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ]);

        $footerSection->update($validated);

        return response()->json(['message' => 'Footer section updated', 'section' => $footerSection]);
    }

    public function destroyFooterSection(FooterSection $footerSection)
    {
        $footerSection->delete();

        return response()->json(['message' => 'Footer section deleted']);
    }

    /* --- Footer Links CRUD --- */

    public function storeFooterLink(Request $request)
    {
        $validated = $request->validate([
            'footer_section_id' => 'nullable|exists:footer_sections,id',
            'label' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'type' => 'nullable|string|in:section_link,legal_link',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ]);

        if (empty($validated['type'])) {
            $validated['type'] = !empty($validated['footer_section_id']) ? 'section_link' : 'legal_link';
        }

        $link = FooterLink::create($validated);

        return response()->json(['message' => 'Footer link created', 'link' => $link], 201);
    }

    public function updateFooterLink(Request $request, FooterLink $footerLink)
    {
        $validated = $request->validate([
            'footer_section_id' => 'nullable|exists:footer_sections,id',
            'label' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|required|string|max:255',
            'type' => 'nullable|string|in:section_link,legal_link',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ]);

        $footerLink->update($validated);

        return response()->json(['message' => 'Footer link updated', 'link' => $footerLink]);
    }

    public function destroyFooterLink(FooterLink $footerLink)
    {
        $footerLink->delete();

        return response()->json(['message' => 'Footer link deleted']);
    }

    /* --- Footer Settings Update --- */

    public function updateFooterSettings(Request $request)
    {
        $validated = $request->validate([
            'footer_brand_name' => 'nullable|string|max:255',
            'footer_description' => 'nullable|string|max:1000',
            'copyright_text' => 'nullable|string|max:550',
        ]);

        if (isset($validated['footer_brand_name'])) {
            StoreSetting::set('footer_brand_name', $validated['footer_brand_name']);
        }
        if (isset($validated['footer_description'])) {
            StoreSetting::set('footer_description', $validated['footer_description']);
        }
        if (isset($validated['copyright_text'])) {
            StoreSetting::set('copyright_text', $validated['copyright_text']);
        }

        return response()->json(['message' => 'Footer settings updated successfully']);
    }
}

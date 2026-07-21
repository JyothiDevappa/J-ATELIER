<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminHeroBannerController extends Controller
{
    /**
     * GET /api/hero-banner
     * Public: returns the active hero banner.
     */
    public function show(): JsonResponse
    {
        $banner = HeroBanner::where('is_active', true)->first();

        if (!$banner) {
            // Return defaults if no banner exists yet
            return response()->json([
                'small_heading'      => 'Spring / Summer 2025',
                'main_heading_line1' => 'The Art of',
                'main_heading_line2' => 'Unhurried Style',
                'primary_btn_text'   => 'Discover Collection',
                'primary_btn_url'    => '/shop',
                'secondary_btn_text' => 'Limited Edition',
                'secondary_btn_url'  => '/shop?collection=limited-edition',
                'desktop_image_path' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90',
                'mobile_image_path'  => null,
            ]);
        }

        return response()->json($banner);
    }

    /**
     * GET /api/admin/hero-banner
     * Admin: returns current banner data for the admin form.
     */
    public function adminShow(): JsonResponse
    {
        $banner = HeroBanner::where('is_active', true)->first()
            ?? HeroBanner::first();

        return response()->json($banner);
    }

    /**
     * POST /api/admin/hero-banner
     * Admin: update hero banner content and/or images.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'small_heading'      => ['nullable', 'string', 'max:255'],
            'main_heading_line1' => ['nullable', 'string', 'max:255'],
            'main_heading_line2' => ['nullable', 'string', 'max:255'],
            'primary_btn_text'   => ['nullable', 'string', 'max:255'],
            'primary_btn_url'    => ['nullable', 'string', 'max:255'],
            'secondary_btn_text' => ['nullable', 'string', 'max:255'],
            'secondary_btn_url'  => ['nullable', 'string', 'max:255'],
            'desktop_image'      => ['nullable', 'image', 'max:5120'],
            'mobile_image'       => ['nullable', 'image', 'max:5120'],
            'remove_mobile_image'=> ['nullable'],
        ]);

        $banner = HeroBanner::where('is_active', true)->first();

        if (!$banner) {
            $banner = new HeroBanner(['is_active' => true]);
        }

        // Update text fields
        $textFields = [
            'small_heading', 'main_heading_line1', 'main_heading_line2',
            'primary_btn_text', 'primary_btn_url',
            'secondary_btn_text', 'secondary_btn_url',
        ];

        foreach ($textFields as $field) {
            if ($request->has($field)) {
                $banner->$field = $request->input($field);
            }
        }

        // Handle desktop image upload
        if ($request->hasFile('desktop_image')) {
            // Delete old file if stored locally
            if ($banner->desktop_image_path && str_starts_with($banner->desktop_image_path, '/storage/')) {
                $relativePath = str_replace('/storage/', '', $banner->desktop_image_path);
                Storage::disk('public')->delete($relativePath);
            }
            $path = $request->file('desktop_image')->store('hero-banner', 'public');
            $banner->desktop_image_path = '/storage/' . $path;
        }

        // Handle mobile image upload
        if ($request->hasFile('mobile_image')) {
            // Delete old file if stored locally
            if ($banner->mobile_image_path && str_starts_with($banner->mobile_image_path, '/storage/')) {
                $relativePath = str_replace('/storage/', '', $banner->mobile_image_path);
                Storage::disk('public')->delete($relativePath);
            }
            $path = $request->file('mobile_image')->store('hero-banner', 'public');
            $banner->mobile_image_path = '/storage/' . $path;
        }

        // Handle remove mobile image
        if (filter_var($request->input('remove_mobile_image'), FILTER_VALIDATE_BOOLEAN)) {
            if ($banner->mobile_image_path && str_starts_with($banner->mobile_image_path, '/storage/')) {
                $relativePath = str_replace('/storage/', '', $banner->mobile_image_path);
                Storage::disk('public')->delete($relativePath);
            }
            $banner->mobile_image_path = null;
        }

        $banner->save();

        return response()->json($banner);
    }
}

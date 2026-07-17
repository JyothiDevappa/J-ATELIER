<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Color;
use App\Models\InstagramGallery;
use Illuminate\Http\JsonResponse;

class PublicHomepageController extends Controller
{
    /**
     * GET /api/homepage/colors
     */
    public function colors(): JsonResponse
    {
        $colors = Color::where('show_on_homepage', true)
            ->whereHas('products')
            ->orderBy('homepage_sort_order')
            ->orderBy('name')
            ->get()
            ->map(function ($color) {
                return [
                    'label' => $color->name,
                    'hex' => $color->hex,
                    'slug' => strtolower(str_replace(' ', '', $color->name)),
                ];
            });

        return response()->json($colors);
    }

    /**
     * GET /api/homepage/instagram-gallery
     */
    public function instagramGallery(): JsonResponse
    {
        $gallery = InstagramGallery::where('is_enabled', true)
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($gallery);
    }
}

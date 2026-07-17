<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminShopByColorController extends Controller
{
    /**
     * GET /api/admin/shop-by-color
     */
    public function index(Request $request): JsonResponse
    {
        $colors = Color::withCount('products')
            ->orderBy('homepage_sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($colors);
    }

    /**
     * PUT /api/admin/shop-by-color
     */
    public function updateAll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'colors' => ['required', 'array'],
            'colors.*.id' => ['required', 'integer', 'exists:colors,id'],
            'colors.*.show_on_homepage' => ['required', 'boolean'],
            'colors.*.homepage_sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['colors'] as $colorData) {
            Color::where('id', $colorData['id'])->update([
                'show_on_homepage' => $colorData['show_on_homepage'],
                'homepage_sort_order' => $colorData['homepage_sort_order'],
            ]);
        }

        return response()->json([
            'message' => 'Homepage colors configuration updated successfully',
        ]);
    }
}

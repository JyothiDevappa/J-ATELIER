<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminColorController extends Controller
{
    /**
     * GET /api/admin/colors
     */
    public function index(Request $request): JsonResponse
    {
        $colors = Color::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json($colors);
    }

    /**
     * POST /api/admin/colors
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'hex' => ['required', 'string', 'max:255'],
        ]);

        $normalizedName = ucwords(strtolower(trim($validated['name'])));
        $hex = trim($validated['hex']);

        $existing = Color::whereRaw('LOWER(name) = ?', [strtolower($normalizedName)])->first();
        if ($existing) {
            return response()->json([
                'message' => 'The color name already exists.',
                'errors' => [
                    'name' => ['The color name already exists.']
                ]
            ], 422);
        }

        $color = Color::create([
            'name' => $normalizedName,
            'hex' => $hex,
        ]);

        return response()->json($color, 201);
    }

    /**
     * PUT /api/admin/colors/{color}
     */
    public function update(Request $request, Color $color): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'hex' => ['required', 'string', 'max:255'],
        ]);

        $normalizedName = ucwords(strtolower(trim($validated['name'])));
        $hex = trim($validated['hex']);

        $existing = Color::whereRaw('LOWER(name) = ?', [strtolower($normalizedName)])
            ->where('id', '!=', $color->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'The color name already exists.',
                'errors' => [
                    'name' => ['The color name already exists.']
                ]
            ], 422);
        }

        $color->update([
            'name' => $normalizedName,
            'hex' => $hex,
        ]);

        return response()->json($color);
    }

    /**
     * DELETE /api/admin/colors/{color}
     */
    public function destroy(Color $color): JsonResponse
    {
        $color->delete();

        return response()->json([
            'message' => 'Color deleted successfully.'
        ]);
    }
}

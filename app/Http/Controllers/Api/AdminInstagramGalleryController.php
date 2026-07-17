<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstagramGallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminInstagramGalleryController extends Controller
{
    /**
     * GET /api/admin/instagram-gallery
     */
    public function index(Request $request): JsonResponse
    {
        $gallery = InstagramGallery::orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($gallery);
    }

    /**
     * POST /api/admin/instagram-gallery
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:2048'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'is_enabled' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $path = $request->file('image')->store('gallery', 'public');
        $imageUrl = '/storage/' . $path;

        $item = InstagramGallery::create([
            'image_path' => $imageUrl,
            'alt_text' => $request->input('alt_text'),
            'instagram_url' => $request->input('instagram_url'),
            'is_enabled' => $request->input('is_enabled', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, InstagramGallery $galleryItem): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['nullable', 'image', 'max:2048'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'is_enabled' => ['nullable'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if ($request->hasFile('image')) {
            if (str_starts_with($galleryItem->image_path, '/storage/')) {
                $relativePath = str_replace('/storage/', '', $galleryItem->image_path);
                Storage::disk('public')->delete($relativePath);
            }
            $path = $request->file('image')->store('gallery', 'public');
            $galleryItem->image_path = '/storage/' . $path;
        }

        if ($request->has('alt_text')) {
            $galleryItem->alt_text = $request->input('alt_text');
        }
        if ($request->has('instagram_url')) {
            $galleryItem->instagram_url = $request->input('instagram_url');
        }
        if ($request->has('is_enabled')) {
            $galleryItem->is_enabled = filter_var($request->input('is_enabled'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('sort_order')) {
            $galleryItem->sort_order = (int) $request->input('sort_order');
        }

        $galleryItem->save();

        return response()->json($galleryItem);
    }

    /**
     * DELETE /api/admin/instagram-gallery/{galleryItem}
     */
    public function destroy(InstagramGallery $galleryItem): JsonResponse
    {
        // Delete image file if it's stored locally
        if (str_starts_with($galleryItem->image_path, '/storage/')) {
            $relativePath = str_replace('/storage/', '', $galleryItem->image_path);
            Storage::disk('public')->delete($relativePath);
        }

        $galleryItem->delete();

        return response()->json([
            'message' => 'Gallery item deleted successfully',
        ]);
    }
}

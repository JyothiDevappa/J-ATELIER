<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    /**
     * GET /api/wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $items = WishlistItem::with('product')
            ->where('user_id', Auth::id())
            ->get()
            ->map(function ($item) use ($request) {
                $productData = (new ProductResource($item->product))->toArray($request);
                $productData['wishlistId'] = $item->id;
                return $productData;
            });

        return response()->json(['data' => $items]);
    }

    /**
     * POST /api/wishlist
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $item = DB::transaction(function () use ($validated) {
            return WishlistItem::firstOrCreate([
                'user_id' => Auth::id(),
                'product_id' => $validated['product_id'],
            ]);
        });

        $item->load('product');

        $productData = (new ProductResource($item->product))->toArray($request);
        $productData['wishlistId'] = $item->id;

        return response()->json(['data' => $productData]);
    }

    /**
     * DELETE /api/wishlist/{wishlistItem}
     */
    public function destroy(WishlistItem $wishlistItem): JsonResponse
    {
        if ($wishlistItem->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::transaction(function () use ($wishlistItem) {
            $wishlistItem->delete();
        });

        return response()->json(null, 204);
    }
}

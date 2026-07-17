<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CartController extends Controller
{
    private function getOrCreateSessionId(Request $request): string
    {
        $sessionId = $request->session()->get('cart_session_id');

        if (!$sessionId) {
            $sessionId = (string) Str::uuid();
            $request->session()->put('cart_session_id', $sessionId);
        }

        return $sessionId;
    }

    private function resolveCartOwner(Request $request): array
    {
        if (Auth::check()) {
            $this->syncSessionCartToUser($request);

            return [
                'user_id' => Auth::id(),
                'session_id' => null,
            ];
        }

        return [
            'user_id' => null,
            'session_id' => $this->getOrCreateSessionId($request),
        ];
    }

    private function syncSessionCartToUser(Request $request): void
    {
        if (!Auth::check()) {
            return;
        }

        $sessionId = $this->getOrCreateSessionId($request);
        $sessionItems = CartItem::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->get();

        foreach ($sessionItems as $sessionItem) {
            $existing = CartItem::where('user_id', Auth::id())
                ->where('product_id', $sessionItem->product_id)
                ->where('size', $sessionItem->size)
                ->where('color', $sessionItem->color)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $sessionItem->quantity);
                $sessionItem->delete();
            } else {
                $sessionItem->user_id = Auth::id();
                $sessionItem->session_id = null;
                $sessionItem->save();
            }
        }
    }

    private function cartQuery(Request $request)
    {
        $owner = $this->resolveCartOwner($request);

        return CartItem::with('product')->where(function ($query) use ($owner): void {
            if ($owner['user_id'] !== null) {
                $query->where('user_id', $owner['user_id']);
            } else {
                $query->where('session_id', $owner['session_id']);
            }
        });
    }

    /**
     * GET /api/cart
     * Return the current cart for the active session or authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $items = $this->cartQuery($request)->get();

        return CartItemResource::collection($items);
    }

    /**
     * POST /api/cart
     * Add a product to the cart, or increment its quantity if it already exists.
     */
    public function store(Request $request): CartItemResource|JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'size'       => ['required', 'string', 'max:10'],
            'color'      => ['required', 'string', 'max:50'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $owner = $this->resolveCartOwner($request);

        $existing = CartItem::where(function ($query) use ($owner): void {
            if ($owner['user_id'] !== null) {
                $query->where('user_id', $owner['user_id']);
            } else {
                $query->where('session_id', $owner['session_id']);
            }
        })
            ->where('product_id', $validated['product_id'])
            ->where('size', $validated['size'])
            ->where('color', $validated['color'])
            ->first();

        $product = Product::find($validated['product_id']);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        if (!$product->active || !$product->in_stock) {
            return response()->json(['message' => 'This product is currently unavailable.'], 422);
        }

        $colorId = \App\Models\Color::where('name', $validated['color'] ?? '')->value('id');
        $variant = \App\Models\ProductVariant::where('product_id', $product->id)
            ->where('color_id', $colorId)
            ->where('size', $validated['size'] ?? '')
            ->first();

        $reserved = OrderItem::where('product_id', $product->id)
            ->where('color', $validated['color'] ?? '')
            ->where('size', $validated['size'] ?? '')
            ->whereHas('order', function ($q) {
                $q->whereIn('status', ['Processing', 'Shipped']);
            })
            ->sum('quantity');

        $availableStock = max(0, ($variant ? $variant->stock : 0) - $reserved);
        $requestedQuantity = $validated['quantity'] + ($existing ? $existing->quantity : 0);

        if ($requestedQuantity > $availableStock) {
            return response()->json([
                'message' => 'Insufficient stock available. Only ' . $availableStock . ' item' . ($availableStock === 1 ? '' : 's') . ' can be added to your cart.'
            ], 422);
        }

        if ($existing) {
            $existing->quantity = $requestedQuantity;
            $existing->save();
            $existing->load('product');
            return new CartItemResource($existing);
        }

        $item = CartItem::create([
            'user_id'    => $owner['user_id'],
            'session_id' => $owner['session_id'],
            'product_id' => $validated['product_id'],
            'size'       => $validated['size'],
            'color'      => $validated['color'],
            'quantity'   => $validated['quantity'],
        ]);

        $item->load('product');

        return new CartItemResource($item);
    }

    /**
     * PUT /api/cart/{cartItem}
     * Update the quantity of a cart item.
     */
    public function update(Request $request, CartItem $cartItem): CartItemResource|JsonResponse
    {
        $owner = $this->resolveCartOwner($request);

        if (($owner['user_id'] !== null && $cartItem->user_id !== $owner['user_id']) || ($owner['user_id'] === null && $cartItem->session_id !== $owner['session_id'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = $cartItem->product;
        if (!$product || !$product->active || !$product->in_stock) {
            return response()->json(['message' => 'This product is currently unavailable.'], 422);
        }

        $colorId = \App\Models\Color::where('name', $cartItem->color)->value('id');
        $variant = \App\Models\ProductVariant::where('product_id', $product->id)
            ->where('color_id', $colorId)
            ->where('size', $cartItem->size)
            ->first();

        $reserved = OrderItem::where('product_id', $product->id)
            ->where('color', $cartItem->color)
            ->where('size', $cartItem->size)
            ->whereHas('order', function ($q) {
                $q->whereIn('status', ['Processing', 'Shipped']);
            })
            ->sum('quantity');

        $availableStock = max(0, ($variant ? $variant->stock : 0) - $reserved);

        if ($validated['quantity'] > $availableStock) {
            return response()->json([
                'message' => 'Insufficient stock available. Only ' . $availableStock . ' item' . ($availableStock === 1 ? '' : 's') . ' can be set for this cart item.'
            ], 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);
        $cartItem->load('product');

        return new CartItemResource($cartItem);
    }

    /**
     * DELETE /api/cart/{cartItem}
     * Remove an item from the cart.
     */
    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        $owner = $this->resolveCartOwner($request);

        if (($owner['user_id'] !== null && $cartItem->user_id !== $owner['user_id']) || ($owner['user_id'] === null && $cartItem->session_id !== $owner['session_id'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $cartItem->delete();

        return response()->json(null, 204);
    }

    /**
     * POST /api/cart/merge
     * Merge guest localStorage cart into the authenticated user's DB cart.
     * Each item is upserted: if the combination already exists, quantity is incremented.
     */
    public function merge(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'items'              => ['required', 'array'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.size'       => ['required', 'string', 'max:10'],
            'items.*.color'      => ['required', 'string', 'max:50'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $owner = $this->resolveCartOwner($request);

        foreach ($request->input('items') as $guestItem) {
            $existing = CartItem::where(function ($query) use ($owner): void {
                if ($owner['user_id'] !== null) {
                    $query->where('user_id', $owner['user_id']);
                } else {
                    $query->where('session_id', $owner['session_id']);
                }
            })
                ->where('product_id', $guestItem['product_id'])
                ->where('size', $guestItem['size'])
                ->where('color', $guestItem['color'])
                ->first();

            if ($existing) {
                $existing->increment('quantity', $guestItem['quantity']);
            } else {
                CartItem::create([
                    'user_id'    => $owner['user_id'],
                    'session_id' => $owner['session_id'],
                    'product_id' => $guestItem['product_id'],
                    'size'       => $guestItem['size'],
                    'color'      => $guestItem['color'],
                    'quantity'   => $guestItem['quantity'],
                ]);
            }
        }

        $items = $this->cartQuery($request)->get();

        return CartItemResource::collection($items);
    }
}

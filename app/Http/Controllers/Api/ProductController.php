<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Color;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * GET /api/products
     *
     * List all active products, ordered by sort_order.
     *
     * Supports optional query parameters:
     *   ?collection=new-arrivals   Filter by collection slug
     *   ?featured=1                Only featured products
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('colors')->active()->orderBy('sort_order');

        if ($request->filled('collection')) {
            $query->collection($request->input('collection'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        return ProductResource::collection($query->get());
    }

    /**
     * GET /api/products/{product}
     *
     * Get a single active product by slug.
     */
    public function show(Product $product): ProductResource
    {
        // Ensure the resolved product is active
        abort_unless($product->active, 404);

        $product->load('colors');

        return new ProductResource($product);
    }

    /**
     * GET /api/admin/products
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('colors')->orderBy('sort_order');

        if ($request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('collection', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('collection')) {
            $query->collection($request->input('collection'));
        }

        // Return 10 products per page
        return ProductResource::collection($query->paginate(10));
    }

    /**
     * POST /api/admin/products
     */
    public function store(Request $request): JsonResponse
    {
        if (empty($request->input('slug'))) {
            $slug = Str::slug($request->input('name'));
            $originalSlug = $slug;
            $count = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
            $request->merge(['slug' => $slug]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'collection' => ['required', 'string', 'max:255'],
            'colors' => ['nullable', 'array', 'max:4'],
            'colors.*.id' => ['required', 'integer', 'exists:colors,id'],
            'sizes' => ['nullable', 'array'],
            'images' => ['required', 'array'],
            'story' => ['nullable', 'string'],
            'fabric_details' => ['nullable', 'string'],
            'care_instructions' => ['nullable', 'string'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'in_stock' => ['required', 'boolean'],
            'active' => ['required', 'boolean'],
            'featured' => ['required', 'boolean'],
            'is_best_seller' => ['required', 'boolean'],
            'is_new' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer'],
        ]);

        $productData = collect($validated)->except('colors')->toArray();
        $product = Product::create($productData);

        $colorIds = [];
        if ($request->has('colors') && is_array($request->input('colors'))) {
            $colorIds = collect($request->input('colors'))->pluck('id')->filter()->toArray();
        }
        $product->colors()->sync($colorIds);
        $product->syncVariants();

        $product->load('colors');

        return response()->json(new ProductResource($product), 201);
    }

    /**
     * PUT /api/admin/products/{product}
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        if (empty($request->input('slug'))) {
            $slug = Str::slug($request->input('name'));
            $originalSlug = $slug;
            $count = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
            $request->merge(['slug' => $slug]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug,' . $product->id],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'collection' => ['required', 'string', 'max:255'],
            'colors' => ['nullable', 'array', 'max:4'],
            'colors.*.id' => ['required', 'integer', 'exists:colors,id'],
            'sizes' => ['nullable', 'array'],
            'images' => ['required', 'array'],
            'story' => ['nullable', 'string'],
            'fabric_details' => ['nullable', 'string'],
            'care_instructions' => ['nullable', 'string'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'in_stock' => ['required', 'boolean'],
            'active' => ['required', 'boolean'],
            'featured' => ['required', 'boolean'],
            'is_best_seller' => ['required', 'boolean'],
            'is_new' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer'],
        ]);

        $productData = collect($validated)->except('colors')->toArray();
        $product->update($productData);

        $colorIds = [];
        if ($request->has('colors') && is_array($request->input('colors'))) {
            $colorIds = collect($request->input('colors'))->pluck('id')->filter()->toArray();
        }
        $product->colors()->sync($colorIds);
        $product->syncVariants();

        $product->load('colors');

        return response()->json(new ProductResource($product));
    }

    /**
     * DELETE /api/admin/products/{product}
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * POST /api/admin/products/upload-image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:2048'],
        ]);

        $path = $request->file('image')->store('products', 'public');

        return response()->json([
            'url' => '/storage/' . $path,
        ]);
    }

    /**
     * GET /api/colors
     */
    public function colorsIndex(): JsonResponse
    {
        $colors = Color::whereHas('products', function ($query) {
            $query->where('active', 1);
        })
        ->withCount(['products' => function ($query) {
            $query->where('active', 1);
        }])
        ->orderByDesc('products_count')
        ->orderBy('homepage_sort_order')
        ->orderBy('name')
        ->get();

        return response()->json($colors);
    }

    /**
     * GET /api/collections
     */
    public function collectionsIndex(): JsonResponse
    {
        $section = \App\Models\HomepageSection::where('section_key', 'featured_collections')->first();
        $items = $section ? ($section->content_json['items'] ?? []) : [];

        $existingSlugs = collect($items)->pluck('slug')->toArray();

        // Also include any product collection slugs not listed in homepage items
        $dbCollections = Product::select('collection')->distinct()->whereNotNull('collection')->where('collection', '!=', '')->pluck('collection');

        foreach ($dbCollections as $colSlug) {
            if (!in_array($colSlug, $existingSlugs)) {
                $items[] = [
                    'label' => Str::title(str_replace('-', ' ', $colSlug)),
                    'slug' => $colSlug,
                    'image' => ''
                ];
            }
        }

        return response()->json($items);
    }
}

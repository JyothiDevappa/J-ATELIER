<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'collection',
        'sizes',
        'images',
        'fabric_details',
        'care_instructions',
        'story',
        'rating',
        'review_count',
        'stock',
        'in_stock',
        'is_new',
        'is_best_seller',
        'featured',
        'active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sizes'          => 'array',
        'images'         => 'array',
        'price'          => 'decimal:2',
        'rating'         => 'decimal:2',
        'review_count'   => 'integer',
        'stock'          => 'integer',
        'in_stock'       => 'boolean',
        'is_new'         => 'boolean',
        'is_best_seller' => 'boolean',
        'featured'       => 'boolean',
        'active'         => 'boolean',
        'sort_order'     => 'integer',
    ];

    /**
     * Boot the model and register event listeners.
     */
    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Scope: only active products.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope: only featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope: filter by collection.
     */
    public function scopeCollection($query, string $collection)
    {
        return $query->where('collection', $collection);
    }

    /**
     * Scope: only in-stock products.
     */
    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    /**
     * Get the route key name for implicit model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * The colors associated with the product.
     */
    public function colors()
    {
        return $this->belongsToMany(Color::class, 'product_color');
    }

    /**
     * The variants associated with the product.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Sync variant records based on current colors and sizes.
     */
    public function syncVariants()
    {
        $colorIds = $this->colors()->pluck('colors.id')->toArray();
        $sizes = $this->sizes ?: [];

        $existingVariants = $this->variants()->get();
        
        $activeCombinations = [];
        foreach ($colorIds as $colorId) {
            foreach ($sizes as $size) {
                $activeCombinations[] = [
                    'color_id' => $colorId,
                    'size' => $size
                ];
            }
        }

        // 1. Create missing combinations
        foreach ($activeCombinations as $comb) {
            $this->variants()->firstOrCreate([
                'color_id' => $comb['color_id'],
                'size' => $comb['size']
            ], [
                'stock' => 0
            ]);
        }

        // 2. Clean up removed combinations
        foreach ($existingVariants as $ev) {
            $stillExists = collect($activeCombinations)->contains(function ($comb) use ($ev) {
                return $comb['color_id'] == $ev->color_id && $comb['size'] == $ev->size;
            });
            if (!$stillExists) {
                $ev->delete();
            }
        }

        // 3. Update overall product stock
        $totalStock = $this->variants()->sum('stock');
        $this->update([
            'stock' => $totalStock,
            'in_stock' => $totalStock > 0
        ]);
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Maps snake_case database columns to camelCase keys
     * to match the existing React frontend interface.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'slug'             => $this->slug,
            'price'            => (float) $this->price,
            'collection'       => $this->collection,
            'colors'           => $this->colors->map(function ($color) {
                return [
                    'id'   => $color->id,
                    'name' => $color->name,
                    'hex'  => $color->hex,
                ];
            })->toArray(),
            'sizes'            => $this->sizes ?? [],
            'images'           => $this->images ?? [],
            'rating'           => (float) $this->rating,
            'reviewCount'      => $this->review_count,
            'description'      => $this->description,
            'fabricDetails'    => $this->fabric_details,
            'careInstructions' => $this->care_instructions,
            'story'            => $this->story,
            'inStock'          => $this->in_stock,
            'stock'            => $this->stock,
            'isNew'            => $this->is_new,
            'isBestSeller'     => $this->is_best_seller,
            'featured'         => $this->featured,
            'active'           => $this->active,
            'sortOrder'        => $this->sort_order,
        ];
    }
}

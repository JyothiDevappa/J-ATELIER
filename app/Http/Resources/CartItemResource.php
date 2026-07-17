<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the cart item into a frontend-ready array.
     *
     * cartId   — the cart_items.id integer used for PUT/DELETE API calls
     * product  — full product data via eager-loaded ProductResource
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cartId'   => $this->id,
            'quantity' => $this->quantity,
            'size'     => $this->size,
            'color'    => $this->color,
            'product'  => new ProductResource($this->whenLoaded('product')),
        ];
    }
}

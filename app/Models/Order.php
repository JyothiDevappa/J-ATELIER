<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'order_number',
        'status',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'postcode',
        'country',
        'delivery_method',
        'delivery_cost',
        'subtotal',
        'total',
        'coupon_code',
        'discount_amount',
    ];

    protected function casts(): array
    {
        return [
            'delivery_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

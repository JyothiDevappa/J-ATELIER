<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order',
        'limit',
        'used',
        'expires_at',
        'active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order' => 'decimal:2',
        'limit' => 'integer',
        'used' => 'integer',
        'expires_at' => 'date:Y-m-d',
        'active' => 'boolean',
    ];

    /**
     * Scope: only active coupons.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Check if coupon is expired.
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }

        return $this->expires_at->startOfDay()->lt(today());
    }
}

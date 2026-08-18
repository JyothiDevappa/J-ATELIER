<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterSection extends Model
{
    protected $table = 'footer_sections';

    protected $fillable = [
        'title',
        'sort_order',
        'is_enabled',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_enabled' => 'boolean',
    ];

    public function links()
    {
        return $this->hasMany(FooterLink::class, 'footer_section_id')->orderBy('sort_order', 'asc');
    }
}

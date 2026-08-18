<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterLink extends Model
{
    protected $table = 'footer_links';

    protected $fillable = [
        'footer_section_id',
        'label',
        'url',
        'type',
        'sort_order',
        'is_enabled',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_enabled' => 'boolean',
    ];

    public function section()
    {
        return $this->belongsTo(FooterSection::class, 'footer_section_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $table = 'homepage_sections';

    protected $fillable = [
        'section_key',
        'title',
        'subtitle',
        'content_json',
        'is_enabled',
    ];

    protected $casts = [
        'content_json' => 'array',
        'is_enabled' => 'boolean',
    ];
}

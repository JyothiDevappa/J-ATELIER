<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update colors table
        Schema::table('colors', function (Blueprint $table) {
            $table->boolean('show_on_homepage')->default(false);
            $table->integer('homepage_sort_order')->default(0);
        });

        // Set default show_on_homepage for existing colors
        DB::table('colors')->whereIn('name', ['Ivory', 'Black', 'Pink', 'Sky Blue', 'Sky blue'])->update([
            'show_on_homepage' => true
        ]);

        // 2. Create instagram_gallery table
        Schema::create('instagram_galleries', function (Blueprint $table) {
            $table->id();
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->string('instagram_url')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed default gallery images
        $defaultGallery = [
            "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80",
            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
            "https://images.unsplash.com/photo-1539109022462-16bc28a182c9?w=600&q=80",
            "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&q=80",
            "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80",
        ];

        foreach ($defaultGallery as $index => $src) {
            DB::table('instagram_galleries')->insert([
                'image_path' => $src,
                'alt_text' => 'As Worn Gallery Image ' . ($index + 1),
                'instagram_url' => 'https://instagram.com',
                'is_enabled' => true,
                'sort_order' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instagram_galleries');

        Schema::table('colors', function (Blueprint $table) {
            $table->dropColumn(['show_on_homepage', 'homepage_sort_order']);
        });
    }
};

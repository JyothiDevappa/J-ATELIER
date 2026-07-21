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
        Schema::create('hero_banners', function (Blueprint $table) {
            $table->id();
            $table->string('small_heading')->default('Spring / Summer 2025');
            $table->string('main_heading_line1')->default('The Art of');
            $table->string('main_heading_line2')->default('Unhurried Style');
            $table->string('primary_btn_text')->default('Discover Collection');
            $table->string('primary_btn_url')->default('/shop');
            $table->string('secondary_btn_text')->default('Limited Edition');
            $table->string('secondary_btn_url')->default('/shop?collection=limited-edition');
            $table->string('desktop_image_path')->default('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90');
            $table->string('mobile_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed the default banner
        DB::table('hero_banners')->insert([
            'small_heading'       => 'Spring / Summer 2025',
            'main_heading_line1'  => 'The Art of',
            'main_heading_line2'  => 'Unhurried Style',
            'primary_btn_text'    => 'Discover Collection',
            'primary_btn_url'     => '/shop',
            'secondary_btn_text'  => 'Limited Edition',
            'secondary_btn_url'   => '/shop?collection=limited-edition',
            'desktop_image_path'  => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90',
            'mobile_image_path'   => null,
            'is_active'           => true,
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hero_banners');
    }
};

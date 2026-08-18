<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('navigation_items', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('url');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('footer_sections', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('footer_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('footer_section_id')->nullable()->constrained('footer_sections')->onDelete('cascade');
            $table->string('label');
            $table->string('url');
            $table->string('type')->default('section_link'); // 'section_link' or 'legal_link'
            $table->integer('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        // Seed default Navbar navigation items
        $defaultNavItems = [
            ['label' => 'Shop All',     'url' => '/shop',                          'sort_order' => 1, 'is_enabled' => true],
            ['label' => 'New Arrivals', 'url' => '/shop?collection=new-arrivals',  'sort_order' => 2, 'is_enabled' => true],
        ];
        foreach ($defaultNavItems as $item) {
            DB::table('navigation_items')->insert(array_merge($item, ['created_at' => now(), 'updated_at' => now()]));
        }

        // Seed default Footer sections
        $shopSectionId = DB::table('footer_sections')->insertGetId([
            'title' => 'Shop',
            'sort_order' => 1,
            'is_enabled' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $supportSectionId = DB::table('footer_sections')->insertGetId([
            'title' => 'Support',
            'sort_order' => 2,
            'is_enabled' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Seed default Footer links for sections
        $defaultFooterLinks = [
            // Shop section links
            ['footer_section_id' => $shopSectionId, 'label' => 'All Products',  'url' => '/shop',                          'type' => 'section_link', 'sort_order' => 1, 'is_enabled' => true],
            ['footer_section_id' => $shopSectionId, 'label' => 'New Arrivals',  'url' => '/shop?collection=new-arrivals',  'type' => 'section_link', 'sort_order' => 2, 'is_enabled' => true],
            ['footer_section_id' => $shopSectionId, 'label' => 'Best Sellers',  'url' => '/shop?collection=best-sellers',  'type' => 'section_link', 'sort_order' => 3, 'is_enabled' => true],

            // Support section links
            ['footer_section_id' => $supportSectionId, 'label' => 'FAQ',                 'url' => '/faq',      'type' => 'section_link', 'sort_order' => 1, 'is_enabled' => true],
            ['footer_section_id' => $supportSectionId, 'label' => 'Returns & Exchanges', 'url' => '/returns',  'type' => 'section_link', 'sort_order' => 2, 'is_enabled' => true],
            ['footer_section_id' => $supportSectionId, 'label' => 'Contact Us',          'url' => '/contact',  'type' => 'section_link', 'sort_order' => 3, 'is_enabled' => true],

            // Footer bottom legal links
            ['footer_section_id' => null, 'label' => 'Privacy Policy',   'url' => '/privacy',  'type' => 'legal_link', 'sort_order' => 1, 'is_enabled' => true],
            ['footer_section_id' => null, 'label' => 'Terms of Service', 'url' => '/terms',    'type' => 'legal_link', 'sort_order' => 2, 'is_enabled' => true],
        ];

        foreach ($defaultFooterLinks as $link) {
            DB::table('footer_links')->insert(array_merge($link, ['created_at' => now(), 'updated_at' => now()]));
        }

        // Seed footer settings into store_settings
        $footerDefaults = [
            ['key' => 'footer_brand_name', 'value' => 'J ATELIER'],
            ['key' => 'footer_description', 'value' => 'Designed for Everyday Comfort. Crafted for Timeless Style. Elevating your everyday wardrobe with intentional pieces.'],
            ['key' => 'copyright_text',    'value' => '© {year} J Atelier. All rights reserved.'],
        ];

        foreach ($footerDefaults as $setting) {
            DB::table('store_settings')->insertOrIgnore($setting);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('footer_links');
        Schema::dropIfExists('footer_sections');
        Schema::dropIfExists('navigation_items');
    }
};

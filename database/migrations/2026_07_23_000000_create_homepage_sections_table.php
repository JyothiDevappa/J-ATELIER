<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->json('content_json')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        // Seed default content matching current site
        $defaults = [
            [
                'section_key' => 'tagline',
                'title' => null,
                'subtitle' => null,
                'content_json' => json_encode([
                    'line1' => 'Designed for Everyday Comfort.',
                    'line2' => 'Crafted for Timeless Style.'
                ]),
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_key' => 'featured_collections',
                'title' => 'Shop by Collection',
                'subtitle' => 'Collections',
                'content_json' => json_encode([
                    'view_all_text' => 'View All',
                    'items' => [
                        ['label' => 'New Arrivals', 'slug' => 'new-arrivals', 'image' => '/images/New Arrivals/aurora-pullover-hoodie-ivory.webp'],
                        ['label' => 'Best Sellers', 'slug' => 'best-sellers', 'image' => '/images/Best Sellers/willow-pullover-hoodie-brown.webp'],
                        ['label' => 'Oversized', 'slug' => 'oversized', 'image' => '/images/oversized/onyx-oversized-hoodie-black.avif'],
                        ['label' => 'Limited Edition', 'slug' => 'limited-edition', 'image' => '/images/limited-edition/azure-long-sleeve-sky-blue.jpg'],
                    ]
                ]),
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_key' => 'limited_edition_banner',
                'title' => 'Limited Edition',
                'subtitle' => 'Rare, Considered, Final',
                'content_json' => json_encode([
                    'btn_text' => 'View Collection',
                    'btn_url' => '/shop?collection=limited-edition',
                    'image_path' => '/images/limited-edition-banner.png'
                ]),
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_key' => 'our_story',
                'title' => "Made with Intention.\nWorn without Effort.",
                'subtitle' => 'Our Story',
                'content_json' => json_encode([
                    'body' => 'J Atelier began in a small studio in Paris with a single question: why does comfort have to look like an afterthought? We set out to make the most beautiful everyday pieces — the ones you reach for without thinking, that feel as considered as anything else in your wardrobe.',
                    'btn_text' => 'Discover the Collection',
                    'btn_url' => '/shop'
                ]),
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_key' => 'why_jatelier',
                'title' => 'Why Choose Us',
                'subtitle' => 'The Difference',
                'content_json' => json_encode([
                    'items' => [
                        [
                            'title' => 'Exceptional Materials',
                            'body' => 'We source only the finest organic cotton, cashmere, and merino. Every fabric is chosen for longevity, softness, and environmental responsibility.'
                        ],
                        [
                            'title' => 'Intentional Design',
                            'body' => 'Every seam, pocket, and proportion is the result of months of refinement. Our pieces are considered, not assembled.'
                        ],
                        [
                            'title' => 'Made to Last',
                            'body' => 'We design against the disposable. Every J Atelier piece is built to outlast trends and improve with wear. Investment dressing for real life.'
                        ]
                    ]
                ]),
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_key' => 'newsletter',
                'title' => 'The Atelier Edit',
                'subtitle' => 'Stay Close',
                'content_json' => json_encode([
                    'description' => 'New arrivals, editorial stories, and the occasional secret — delivered quietly to your inbox.',
                    'input_placeholder' => 'Your email address',
                    'btn_text' => 'Subscribe'
                ]),
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($defaults as $default) {
            DB::table('homepage_sections')->insert($default);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};

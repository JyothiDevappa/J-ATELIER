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
        // 1. Create colors table
        Schema::create('colors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('hex');
            $table->timestamps();
        });

        // 2. Create product_color pivot table
        Schema::create('product_color', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('color_id')->constrained('colors')->cascadeOnDelete();
            $table->timestamps();
        });

        // 3. Pre-populate predefined colors (Black, White, Gray, Red, Blue, Green, Pink, Brown, Beige, Yellow, Orange, Purple)
        $predefined = [
            'Black' => '#000000',
            'White' => '#FFFFFF',
            'Gray' => '#808080',
            'Red' => '#FF0000',
            'Blue' => '#0000FF',
            'Green' => '#008000',
            'Pink' => '#FFC0CB',
            'Brown' => '#A52A2A',
            'Beige' => '#F5F5DC',
            'Yellow' => '#FFFF00',
            'Orange' => '#FFA500',
            'Purple' => '#800080',
        ];

        foreach ($predefined as $name => $hex) {
            DB::table('colors')->insertOrIgnore([
                'name' => $name,
                'hex' => $hex,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Migrate existing products' colors data to the pivot table
        $products = DB::table('products')->get();
        foreach ($products as $product) {
            if (!empty($product->colors)) {
                $colorsList = json_decode($product->colors, true);
                if (is_array($colorsList)) {
                    foreach ($colorsList as $colorData) {
                        $name = $colorData['name'] ?? null;
                        $hex = $colorData['hex'] ?? null;

                        if ($name && $hex) {
                            // Find or create in colors
                            $colorId = DB::table('colors')->where('name', $name)->value('id');
                            if (!$colorId) {
                                $colorId = DB::table('colors')->insertGetId([
                                    'name' => $name,
                                    'hex' => $hex,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ]);
                            }
                            
                            // Insert into pivot
                            DB::table('product_color')->insertOrIgnore([
                                'product_id' => $product->id,
                                'color_id' => $colorId,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        }

        // 5. Drop columns in products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['primary_color', 'colors']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back columns
        Schema::table('products', function (Blueprint $table) {
            $table->string('primary_color')->nullable();
            $table->json('colors')->nullable();
        });

        $productColors = DB::table('product_color')
            ->join('colors', 'product_color.color_id', '=', 'colors.id')
            ->select('product_color.product_id', 'colors.name', 'colors.hex')
            ->get();
        
        $grouped = [];
        foreach ($productColors as $pc) {
            $grouped[$pc->product_id][] = ['name' => $pc->name, 'hex' => $pc->hex];
        }

        foreach ($grouped as $productId => $list) {
            DB::table('products')->where('id', $productId)->update([
                'colors' => json_encode($list),
                'primary_color' => $list[0]['name'] ?? null
            ]);
        }

        Schema::dropIfExists('product_color');
        Schema::dropIfExists('colors');
    }
};

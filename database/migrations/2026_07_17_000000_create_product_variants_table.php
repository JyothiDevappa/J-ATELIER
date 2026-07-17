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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('color_id')->nullable()->constrained('colors')->nullOnDelete();
            $table->string('size')->nullable();
            $table->integer('stock')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'color_id', 'size']);
        });

        // Migrate existing stock data from products
        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $colors = DB::table('product_color')->where('product_id', $product->id)->pluck('color_id');
            $sizes = json_decode($product->sizes, true) ?: [];

            $combinations = [];
            foreach ($colors as $colorId) {
                foreach ($sizes as $size) {
                    $combinations[] = ['color_id' => $colorId, 'size' => $size];
                }
            }

            if (count($combinations) > 0) {
                $baseStock = floor($product->stock / count($combinations));
                $remainder = $product->stock % count($combinations);

                foreach ($combinations as $index => $comb) {
                    $allocatedStock = $baseStock + ($index === 0 ? $remainder : 0);
                    DB::table('product_variants')->insert([
                        'product_id' => $product->id,
                        'color_id' => $comb['color_id'],
                        'size' => $comb['size'],
                        'stock' => $allocatedStock,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } else {
                DB::table('product_variants')->insert([
                    'product_id' => $product->id,
                    'color_id' => null,
                    'size' => null,
                    'stock' => $product->stock,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};

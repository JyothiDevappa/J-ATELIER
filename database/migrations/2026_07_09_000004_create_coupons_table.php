<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->index();
            $table->string('type'); // 'Percentage' or 'Fixed'
            $table->decimal('value', 10, 2);
            $table->decimal('min_order', 10, 2)->default(0.00);
            $table->integer('limit')->nullable(); // null means unlimited
            $table->integer('used')->default(0);
            $table->date('expires_at')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};

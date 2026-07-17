<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default store information
        $defaults = [
            ['key' => 'store_name',    'value' => 'J Atelier'],
            ['key' => 'store_url',     'value' => 'jatelier.com'],
            ['key' => 'support_email', 'value' => 'hello@jatelier.com'],
            ['key' => 'currency',      'value' => 'USD'],
        ];

        foreach ($defaults as $setting) {
            DB::table('store_settings')->insertOrIgnore($setting);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};

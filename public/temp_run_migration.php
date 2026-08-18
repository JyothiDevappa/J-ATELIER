<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

try {
    $migration = require __DIR__ . '/../database/migrations/2026_07_22_000000_create_navigation_and_footer_tables.php';
    if (!Illuminate\Support\Facades\Schema::hasTable('navigation_items')) {
        $migration->up();
        echo "SUCCESS: Tables created and seeded.";
    } else {
        echo "ALREADY_EXISTS: Tables already present.";
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage();
}

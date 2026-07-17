<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
header('Content-Type: application/json');
$products = App\Models\Product::all();
$errors = [];
foreach ($products as $p) {
    if (empty($p->colors)) {
        $errors[] = "Product ID {$p->id} ({$p->name}) has empty colors";
    } else {
        foreach ($p->colors as $c) {
            if (empty($c['label']) && empty($c['name'])) {
                $errors[] = "Product ID {$p->id} ({$p->name}) color has no label or name";
            }
        }
    }
}
echo json_encode(['errors' => $errors, 'count' => count($products)]);

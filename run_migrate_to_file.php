<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

try {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $output = \Illuminate\Support\Facades\Artisan::output();
    file_put_contents('migrate_output.txt', "SUCCESS:\n" . $output);
} catch (\Exception $e) {
    file_put_contents('migrate_output.txt', "ERROR:\n" . $e->getMessage() . "\n" . $e->getTraceAsString());
}

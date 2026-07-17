<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$migrator = app('migrator');
$pending = $migrator->getMigrationFiles(database_path('migrations'));
$ran = $migrator->getRepository()->getRan();

echo "Ran:\n";
print_r($ran);
echo "\nPending:\n";
print_r(array_diff(array_keys($pending), $ran));

echo "\nRunning migrations now...\n";
try {
    $migrator->run(database_path('migrations'));
    echo "\nSuccess! Migrations executed.\n";
} catch (\Exception $e) {
    echo "\nError:\n" . $e->getMessage() . "\n" . $e->getTraceAsString();
}

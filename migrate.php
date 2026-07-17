<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$output = new Symfony\Component\Console\Output\BufferedOutput();
$status = $kernel->handle(
    $input = new Symfony\Component\Console\Input\ArrayInput([
        'command' => 'migrate',
        '--force' => true,
    ]),
    $output
);

echo $output->fetch();

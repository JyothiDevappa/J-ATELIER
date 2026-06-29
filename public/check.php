<?php
$output = shell_exec('cd ' . escapeshellarg(__DIR__ . '/../') . ' && php artisan view:clear 2>&1');
echo "<pre>$output</pre>";

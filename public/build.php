<?php
header('Content-Type: text/plain');
$output = [];
$return_var = 0;
// Change directory to the workspace root and run npm run build
$cmd = 'cd ' . escapeshellarg(dirname(__DIR__)) . ' && npm run build 2>&1';
exec($cmd, $output, $return_var);
echo "=== Build Status: $return_var ===\n";
echo implode("\n", $output) . "\n";

<?php
try {
    $orders = require 'database/migrations/2026_07_09_000000_create_orders_table.php';
    echo "Orders loaded successfully. Type: " . get_class($orders) . "\n";
    $orderItems = require 'database/migrations/2026_07_09_000001_create_order_items_table.php';
    echo "Order items loaded successfully. Type: " . get_class($orderItems) . "\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage();
}

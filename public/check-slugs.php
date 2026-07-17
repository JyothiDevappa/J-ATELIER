<?php
$conn = new mysqli("127.0.0.1", "root", "", "jatelier");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = $conn->query("DESCRIBE settings");
if ($result) {
    echo "<pre>";
    while ($row = $result->fetch_assoc()) {
        print_r($row);
    }
    echo "</pre>";
} else {
    echo "Query failed: " . $conn->error;
}
$conn->close();
?>

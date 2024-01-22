<?php
$host = "localhost";
$username = "linenlou_admin";
$password = "wj97fG7KC7mD@ZY";
$database = "linenlou_data";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$result = $conn->query("SELECT * FROM examples");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$conn->close();
?>

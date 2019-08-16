<?php
$servername = "192.168.1.12";
$username = "admin";
$password = "0x00ff0000";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
echo "Connected successfully";
?>
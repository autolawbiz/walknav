<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// JSON受け取り
$input = json_decode(file_get_contents("php://input"), true);

$origin = $input["origin"];         // [lng, lat]
$destination = $input["destination"]; // [lng, lat]

// Mapbox APIキー（本番環境用）
$apiKey = "";  // GitHub用
// $apiKey = "pk.xxx";  // ローカル・本番用

$url = "https://api.mapbox.com/directions/v5/mapbox/walking/"
     . "{$origin[0]},{$origin[1]};{$destination[0]},{$destination[1]}"
     . "?geometries=geojson&overview=full&access_token={$apiKey}";

// API呼び出し
$response = file_get_contents($url);
echo $response;

<?php

$data = array(
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'request' => $_REQUEST,
    'files' => $_FILES,
    'input' => file_get_contents('php://input'),
);
$mode = strtolower($_GET['mode']);
$target = trim($_GET['target']);
$empty = isset($_GET['empty']);

if ($mode === 'csp') {
    header("Content-Security-Policy: script-src 'self'; form-action 'self';");
} else if ($mode === 'redirect') {
    header('Location: ' . (empty($target) ? '/' : $target));
}

if ($empty) {
    return;
}

$body = print_r($data, true);
header('Content-Type: text/plain');
header('Content-Length: ' . strlen($body));
header('X-Script: <script>alert(1)</script>');
print($body);

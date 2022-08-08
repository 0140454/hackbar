<?php

$data = array(
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'request' => $_REQUEST,
    'files' => $_FILES,
    'input' => file_get_contents('php://input'),
);
$mode = strtolower($_GET['mode']);

header('Content-Type: text/plain');
if ($mode === 'csp') {
    header("Content-Security-Policy: script-src 'self'; form-action 'self';");
}
print_r($data);

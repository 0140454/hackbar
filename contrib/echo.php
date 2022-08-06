<?php

$data = array(
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'request' => $_REQUEST,
    'files' => $_FILES,
    'input' => file_get_contents('php://input'),
);

header('Content-Type: text/plain');
print_r($data);

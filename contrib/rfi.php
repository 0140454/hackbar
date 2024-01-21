<?php

if (!empty($_GET['url'])) {
    include_once $_GET['url'];
}

highlight_file(__FILE__);

<?php

if (!empty($_GET['url'])) {
    include($_GET['url']);
}

highlight_file(__FILE__);

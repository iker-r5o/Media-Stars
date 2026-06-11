<?php
require_once 'helpers.php';

requireMethod('GET');
sendJson(getAllItems());
?>

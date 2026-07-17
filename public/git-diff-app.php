<?php
header('Content-Type: text/plain');
echo shell_exec('git diff -- ../bootstrap/app.php 2>&1');

<?php
  $exif = $_POST['exif'];
  $base64 = $_POST['base64'];
  $base64_body = substr(strstr($base64,','),1);
  $IMG = base64_decode($base64_body); 
  file_put_contents('php.jpeg', $IMG );
?>

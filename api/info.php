<?php
// Check Apache modules and configuration
echo "<h1>Apache Configuration Check</h1>";

// Check if mod_rewrite is loaded
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    if (in_array('mod_rewrite', $modules)) {
        echo "<p style='color: green;'>✅ mod_rewrite is enabled</p>";
    } else {
        echo "<p style='color: red;'>❌ mod_rewrite is NOT enabled</p>";
        echo "<p><strong>Solution:</strong> Edit C:/xampp/apache/conf/httpd.conf and uncomment:</p>";
        echo "<pre>#LoadModule rewrite_module modules/mod_rewrite.so</pre>";
        echo "<p>Remove the # to enable it, then restart Apache.</p>";
    }
} else {
    echo "<p style='color: orange;'>⚠️ Cannot check Apache modules (function not available)</p>";
}

// Show PHP info
echo "<h2>PHP Configuration</h2>";
echo "<p>PHP Version: " . PHP_VERSION . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Current Script: " . $_SERVER['SCRIPT_NAME'] . "</p>";

// Check .htaccess support
echo "<h2>.htaccess Support</h2>";
if (getenv('HTTP_MOD_REWRITE') === 'On' || isset($_SERVER['HTTP_MOD_REWRITE'])) {
    echo "<p style='color: green;'>✅ .htaccess appears to be working</p>";
} else {
    echo "<p style='color: orange;'>⚠️ .htaccess support unclear</p>";
}

// Test direct API access
echo "<h2>Direct API Test</h2>";
echo "<p><a href='index.php'>Test direct API access</a></p>";

// Show current directory contents
echo "<h2>Current Directory</h2>";
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        echo "<p>" . htmlspecialchars($file) . "</p>";
    }
}
?>

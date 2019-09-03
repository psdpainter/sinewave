<!DOCTYPE html>
<html lang="en-us">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- the page description will flow through to the page header description below -->
    <meta name="description" content="<?php echo !empty($page_description) ? $page_description : ""; ?>"/>
    <!-- the page title will flow through to the page header heading tag below -->
    <title><?php echo !empty($page_title) ? $page_title : ""; ?></title>
    <link rel="stylesheet" href="/assets/css/sinewave.css?v=<?php echo str_shuffle(uniqid()); ?>" />
</head>
<body class="modern|is-edge|is-ie">
    <div class="container">
        <main role="main" class="main-content">
            <!-- each page should implement the following page header through an include/require -->
            <header class="page-header">
                <h2 class="heading"><?php echo $page_title; ?></h2>
                <div><?php echo $page_description; ?></div>
            </header>
            <div class="wrapper">
            <!-- all page content should be inserted here -->
            </div>
        </main>
    </div>
    <!-- insert sidebar here -->
    <script src="/assets/js/sinewave.js?v=<?php echo str_shuffle(uniqid()); ?>"></script>
</body>
</html>

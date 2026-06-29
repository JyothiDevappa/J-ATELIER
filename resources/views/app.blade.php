<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>J Atelier</title>
    <meta name="description" content="J Atelier — Premium fashion & lifestyle store." />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="J Atelier" />
    <meta property="og:description" content="J Atelier — Premium fashion & lifestyle store." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="J Atelier" />
    <meta name="twitter:description" content="J Atelier — Premium fashion & lifestyle store." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script>
      window.addEventListener('error', function(event) {
        document.getElementById('root').innerHTML += '<div style="color:red; padding: 20px;"><h1>Global JS Error</h1><pre>' + event.error?.message + '</pre><pre>' + event.error?.stack + '</pre></div>';
      });
      window.addEventListener('unhandledrejection', function(event) {
        document.getElementById('root').innerHTML += '<div style="color:red; padding: 20px;"><h1>Unhandled Promise Rejection</h1><pre>' + event.reason?.message + '</pre><pre>' + event.reason?.stack + '</pre></div>';
      });
    </script>
    @viteReactRefresh
    @vite(['resources/js/main.tsx'])
  </head>
  <body>
    <div id="root">
      <h1 style="color: blue; padding: 20px;">If you see this text, React has failed to load or mount entirely. Please tell me if you see this.</h1>
    </div>
  </body>
</html>

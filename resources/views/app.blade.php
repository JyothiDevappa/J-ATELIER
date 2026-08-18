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
    @viteReactRefresh
    @vite(['resources/js/main.tsx'])
  </head>
  <body class="bg-[#FAF9F6] text-stone-900 antialiased">
    <div id="root">
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center;">
          <div style="font-size: 26px; letter-spacing: 0.3em; font-weight: 300; text-transform: uppercase; color: #1C1917; margin-bottom: 8px;">J ATELIER</div>
          <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #78716C;">Loading Collection...</div>
        </div>
      </div>
    </div>
  </body>
</html>

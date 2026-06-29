<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Explicitly tell Laravel where to find the Vite manifest.
        // Vite 5+ (used by laravel-vite-plugin v2.x) defaults to placing
        // the manifest at `.vite/manifest.json` inside the build directory,
        // but we override this in vite.config.ts to output it at the root
        // of public/build/. This call ensures the PHP helper agrees.
        Vite::useManifestFilename('manifest.json');
    }
}

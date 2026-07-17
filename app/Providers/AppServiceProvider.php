<?php

namespace App\Providers;

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
        try {
            // Run migrations automatically
            \Illuminate\Support\Facades\Artisan::call('migrate');

            // Seed default admin user
            $adminExists = \App\Models\User::where('email', 'admin')->exists();
            if (!$adminExists) {
                \App\Models\User::create([
                    'name' => 'Admin',
                    'email' => 'admin',
                    'password' => \Illuminate\Support\Facades\Hash::make('admin@123'),
                    'is_admin' => true,
                ]);
            }
        } catch (\Exception $e) {
            // Silence exceptions during asset building or if DB is not ready yet
        }
    }
}

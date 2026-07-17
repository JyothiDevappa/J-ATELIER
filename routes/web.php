<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Admin routes are split into two groups:
|   1. /admin/login  — public, serves the SPA so the login page can render
|   2. /admin*       — protected by EnsureAdminAuthenticated middleware
|                      Unauthenticated or non-admin requests are redirected
|                      server-side to /admin/login before any HTML is sent.
|   3. /{any?}       — catch-all: serves the SPA for all other frontend routes
|
| This gives us a proper server-side auth gate even for an SPA architecture.
|
*/

// ── 1. Admin login page — public (must come BEFORE the protected group) ────
Route::get('/admin/login', function () {
    return view('app');
})->name('admin.login');

// ── 2. Protected admin SPA routes ──────────────────────────────────────────
//    The middleware checks the session, redirects to /admin/login if invalid.
Route::middleware('admin.auth')->group(function () {
    Route::get('/admin',            fn () => view('app'));
    Route::get('/admin/products',   fn () => view('app'));
    Route::get('/admin/orders',     fn () => view('app'));
    Route::get('/admin/customers',  fn () => view('app'));
    Route::get('/admin/analytics',  fn () => view('app'));
    Route::get('/admin/coupons',    fn () => view('app'));
    Route::get('/admin/inventory',  fn () => view('app'));
    Route::get('/admin/settings',   fn () => view('app'));
});

// ── 3. All other frontend routes — SPA catch-all ───────────────────────────
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');

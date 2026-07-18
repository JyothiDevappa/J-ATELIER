<?php

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AdminSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Read-only product API. All routes are prefixed with /api
| and return JSON responses.
|
*/

// Store settings — public GET so the brand name loads on every page start
Route::get('/settings/general',  [AdminSettingsController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/colors', [ProductController::class, 'colorsIndex']);
Route::get('/homepage/colors', [\App\Http\Controllers\Api\PublicHomepageController::class, 'colors']);
Route::get('/homepage/instagram-gallery', [\App\Http\Controllers\Api\PublicHomepageController::class, 'instagramGallery']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::get('/orders', [\App\Http\Controllers\Api\CheckoutController::class, 'index']);
    
    Route::get('/addresses', [\App\Http\Controllers\Api\AddressController::class, 'index']);
    Route::post('/addresses', [\App\Http\Controllers\Api\AddressController::class, 'store']);
    Route::put('/addresses/{address}', [\App\Http\Controllers\Api\AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [\App\Http\Controllers\Api\AddressController::class, 'destroy']);
    Route::put('/addresses/{address}/default', [\App\Http\Controllers\Api\AddressController::class, 'setDefault']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{wishlistItem}', [WishlistController::class, 'destroy']);

    // Admin Authenticated Routes Group
    Route::group(['middleware' => [function ($request, $next) {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }
        return $next($request);
    }]], function () {
        Route::post('/admin/settings/general', [AdminSettingsController::class, 'update']);
        Route::post('/admin/settings/security', [AdminSettingsController::class, 'updateSecurity']);

        // Admin Products Management
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::put('/admin/products/{product:id}', [ProductController::class, 'update']);
        Route::delete('/admin/products/{product:id}', [ProductController::class, 'destroy']);
        Route::post('/admin/products/upload-image', [ProductController::class, 'uploadImage']);
        Route::get('/admin/colors', [\App\Http\Controllers\Api\AdminColorController::class, 'index']);
        Route::post('/admin/colors', [\App\Http\Controllers\Api\AdminColorController::class, 'store']);
        Route::put('/admin/colors/{color}', [\App\Http\Controllers\Api\AdminColorController::class, 'update']);
        Route::delete('/admin/colors/{color}', [\App\Http\Controllers\Api\AdminColorController::class, 'destroy']);

        // Admin Orders Management
        Route::get('/admin/orders', [\App\Http\Controllers\Api\AdminOrderController::class, 'index']);
        Route::get('/admin/orders/{order:id}', [\App\Http\Controllers\Api\AdminOrderController::class, 'show']);
        Route::put('/admin/orders/{order:id}/status', [\App\Http\Controllers\Api\AdminOrderController::class, 'updateStatus']);

        // Admin Dashboard Overview
        Route::get('/admin/dashboard', [\App\Http\Controllers\Api\AdminDashboardController::class, 'index']);

        // Admin Customers Management
        Route::get('/admin/customers', [\App\Http\Controllers\Api\AdminCustomerController::class, 'index']);
        Route::get('/admin/customers/{user:id}', [\App\Http\Controllers\Api\AdminCustomerController::class, 'show']);

        // Admin Inventory Management
        Route::get('/admin/inventory', [\App\Http\Controllers\Api\AdminInventoryController::class, 'index']);
        Route::put('/admin/inventory/{product:id}', [\App\Http\Controllers\Api\AdminInventoryController::class, 'update']);
        Route::put('/admin/inventory/variant/{variant}', [\App\Http\Controllers\Api\AdminInventoryController::class, 'updateVariant']);

        // Admin Shop by Color Management
        Route::get('/admin/shop-by-color', [\App\Http\Controllers\Api\AdminShopByColorController::class, 'index']);
        Route::put('/admin/shop-by-color', [\App\Http\Controllers\Api\AdminShopByColorController::class, 'updateAll']);

        // Admin Instagram Gallery Management
        Route::get('/admin/instagram-gallery', [\App\Http\Controllers\Api\AdminInstagramGalleryController::class, 'index']);
        Route::post('/admin/instagram-gallery', [\App\Http\Controllers\Api\AdminInstagramGalleryController::class, 'store']);
        Route::put('/admin/instagram-gallery/{galleryItem}', [\App\Http\Controllers\Api\AdminInstagramGalleryController::class, 'update']);
        Route::delete('/admin/instagram-gallery/{galleryItem}', [\App\Http\Controllers\Api\AdminInstagramGalleryController::class, 'destroy']);

        // Admin Coupons Management
        Route::get('/admin/coupons', [\App\Http\Controllers\Api\AdminCouponController::class, 'index']);
        Route::post('/admin/coupons', [\App\Http\Controllers\Api\AdminCouponController::class, 'store']);
        Route::put('/admin/coupons/{coupon}', [\App\Http\Controllers\Api\AdminCouponController::class, 'update']);
        Route::delete('/admin/coupons/{coupon}', [\App\Http\Controllers\Api\AdminCouponController::class, 'destroy']);

        // Admin Analytics
        Route::get('/admin/analytics', [\App\Http\Controllers\Api\AdminAnalyticsController::class, 'index']);
    });
});

    // Cart — /merge must be defined before /{cartItem} to prevent route collision
    Route::get('/cart',                [CartController::class, 'index']);
    Route::post('/cart',               [CartController::class, 'store']);
    Route::post('/cart/merge',         [CartController::class, 'merge']);
    Route::put('/cart/{cartItem}',     [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}',  [CartController::class, 'destroy']);
    
    // Checkout
    Route::post('/checkout', [\App\Http\Controllers\Api\CheckoutController::class, 'store']);

    // Coupon Validation
    Route::post('/coupons/validate', [\App\Http\Controllers\Api\AdminCouponController::class, 'validateCoupon']);

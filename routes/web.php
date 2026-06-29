<?php

use Illuminate\Support\Facades\Route;

// Catch all routes and let React handle client-side routing
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');

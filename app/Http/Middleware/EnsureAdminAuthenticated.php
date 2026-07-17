<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureAdminAuthenticated
 *
 * Web-layer middleware that protects all /admin/* routes.
 * - If the user is NOT authenticated, redirect to /admin/login.
 * - If the user IS authenticated but NOT an admin, also redirect to /admin/login.
 * - Only admin users (is_admin = true) are allowed through.
 *
 * This is the server-side guard for the admin panel — the React
 * AdminProtectedRoute component acts as a secondary client-side guard.
 */
class EnsureAdminAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        // Not logged in at all → redirect to admin login
        if (!$user) {
            return redirect('/admin/login');
        }

        // Logged in but not an admin → redirect to admin login
        if (!$user->is_admin) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect('/admin/login');
        }

        return $next($request);
    }
}

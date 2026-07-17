<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminSettingsController extends Controller
{
    /**
     * GET /api/admin/settings/general
     * Returns the current store information settings.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'store_name'    => StoreSetting::get('store_name', 'J Atelier'),
            'store_url'     => StoreSetting::get('store_url', 'jatelier.com'),
            'support_email' => StoreSetting::get('support_email', 'hello@jatelier.com'),
            'currency'      => StoreSetting::get('currency', 'USD'),
        ]);
    }

    /**
     * POST /api/admin/settings/general
     * Saves / updates the store information settings.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_name'    => 'required|string|max:255',
            'store_url'     => 'required|string|max:255',
            'support_email' => 'required|email|max:255',
            'currency'      => 'required|string|max:10',
        ]);

        foreach ($validated as $key => $value) {
            StoreSetting::set($key, $value);
        }

        return response()->json([
            'message'       => 'Store settings saved successfully.',
            'store_name'    => $validated['store_name'],
            'store_url'     => $validated['store_url'],
            'support_email' => $validated['support_email'],
            'currency'      => $validated['currency'],
        ]);
    }

    /**
     * POST /api/admin/settings/security
     *
     * Updates the admin's email and/or password.
     * - current_password is always required (proves identity).
     * - new_email + confirm_email are optional; if provided, email is updated.
     * - new_password + confirm_password are optional; if provided, password is updated.
     * - At least one of (new_email, new_password) must be present.
     * - After save, the old credentials become invalid immediately.
     */
    public function updateSecurity(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Validation rules
        $rules = [
            'current_password' => 'required|string',
            'new_email'        => 'sometimes|nullable|email|max:255|unique:users,email,' . $user->id,
            'confirm_email'    => 'sometimes|nullable|string|same:new_email',
            'new_password'     => 'sometimes|nullable|string|min:8',
            'confirm_password' => 'sometimes|nullable|string|same:new_password',
        ];

        $messages = [
            'confirm_email.same'    => 'The email confirmation does not match.',
            'confirm_password.same' => 'The password confirmation does not match.',
            'new_email.unique'      => 'This email address is already in use.',
        ];

        $validated = $request->validate($rules, $messages);

        // Verify current password before making any changes
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The provided current password does not match our records.',
                'errors'  => [
                    'current_password' => ['The provided current password is incorrect.'],
                ],
            ], 422);
        }

        $hasEmail    = !empty($validated['new_email']);
        $hasPassword = !empty($validated['new_password']);

        // At least one change must be requested
        if (!$hasEmail && !$hasPassword) {
            return response()->json([
                'message' => 'Please provide a new email, a new password, or both.',
            ], 422);
        }

        // Apply changes
        if ($hasEmail) {
            $user->email = $validated['new_email'];
        }
        if ($hasPassword) {
            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        $updated = [];
        if ($hasEmail)    $updated[] = 'email';
        if ($hasPassword) $updated[] = 'password';

        return response()->json([
            'message' => 'Security settings updated: ' . implode(' and ', $updated) . ' changed successfully.',
            'email'   => $user->email,
        ]);
    }
}


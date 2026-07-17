<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(): JsonResponse
    {
        $addresses = Address::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($addresses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255'],
            'phone'      => ['required', 'string', 'max:20'],
            'address'    => ['required', 'string', 'max:255'],
            'city'       => ['required', 'string', 'max:255'],
            'postcode'   => ['required', 'string', 'max:50'],
            'country'    => ['required', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $userId = Auth::id();
        $isDefault = !empty($validated['is_default']);
        $address = null;

        DB::transaction(function () use ($userId, &$isDefault, &$address, $validated) {
            if ($isDefault) {
                Address::where('user_id', $userId)->update(['is_default' => false]);
            }

            // If it's the first address, make it default automatically
            $hasAddresses = Address::where('user_id', $userId)->exists();
            if (!$hasAddresses) {
                $isDefault = true;
            }

            $address = Address::create(array_merge($validated, [
                'user_id' => $userId,
                'is_default' => $isDefault,
            ]));
        });

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255'],
            'phone'      => ['required', 'string', 'max:20'],
            'address'    => ['required', 'string', 'max:255'],
            'city'       => ['required', 'string', 'max:255'],
            'postcode'   => ['required', 'string', 'max:50'],
            'country'    => ['required', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $userId = Auth::id();
        $isDefault = !empty($validated['is_default']);

        DB::transaction(function () use ($userId, $isDefault, $address, $validated) {
            if ($isDefault) {
                Address::where('user_id', $userId)->where('id', '!=', $address->id)->update(['is_default' => false]);
            }

            $address->update(array_merge($validated, [
                'is_default' => $isDefault,
            ]));
        });

        return response()->json($address);
    }

    public function destroy(Address $address): JsonResponse
    {
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $wasDefault = $address->is_default;
        $userId = Auth::id();

        DB::transaction(function () use ($address, $wasDefault, $userId) {
            $address->delete();

            // If we deleted the default address, make the latest address default
            if ($wasDefault) {
                $latest = Address::where('user_id', $userId)->latest()->first();
                if ($latest) {
                    $latest->update(['is_default' => true]);
                }
            }
        });

        return response()->json(['message' => 'Address deleted successfully']);
    }

    public function setDefault(Address $address): JsonResponse
    {
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userId = Auth::id();

        DB::transaction(function () use ($address, $userId) {
            Address::where('user_id', $userId)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return response()->json($address);
    }
}

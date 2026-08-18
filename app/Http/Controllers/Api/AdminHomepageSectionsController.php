<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminHomepageSectionsController extends Controller
{
    /**
     * Public API endpoint for Home.tsx
     */
    public function publicIndex()
    {
        $sections = HomepageSection::where('is_enabled', true)->get();
        $formatted = [];

        foreach ($sections as $section) {
            $formatted[$section->section_key] = [
                'title' => $section->title,
                'subtitle' => $section->subtitle,
                'content' => $section->content_json,
                'is_enabled' => $section->is_enabled,
            ];
        }

        return response()->json($formatted);
    }

    /**
     * Admin API endpoint to fetch all sections for editing
     */
    public function adminIndex()
    {
        $sections = HomepageSection::all();
        $formatted = [];

        foreach ($sections as $section) {
            $formatted[$section->section_key] = [
                'id' => $section->id,
                'section_key' => $section->section_key,
                'title' => $section->title,
                'subtitle' => $section->subtitle,
                'content' => $section->content_json,
                'is_enabled' => $section->is_enabled,
            ];
        }

        return response()->json($formatted);
    }

    /**
     * Update a specific homepage section
     */
    public function updateSection(Request $request)
    {
        $validated = $request->validate([
            'section_key' => 'required|string',
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'content' => 'nullable|array',
            'is_enabled' => 'boolean',
        ]);

        $section = HomepageSection::where('section_key', $validated['section_key'])->first();

        if (!$section) {
            $section = new HomepageSection();
            $section->section_key = $validated['section_key'];
        }

        $section->title = $validated['title'] ?? null;
        $section->subtitle = $validated['subtitle'] ?? null;
        if (isset($validated['content'])) {
            $section->content_json = $validated['content'];
        }
        if (isset($validated['is_enabled'])) {
            $section->is_enabled = $validated['is_enabled'];
        }

        $section->save();

        return response()->json(['message' => 'Homepage section updated successfully', 'section' => $section]);
    }

    /**
     * Upload an image for banners or collections
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,avif|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('homepage', 'public');
            $url = Storage::url($path);
            return response()->json(['url' => $url]);
        }

        return response()->json(['message' => 'Image upload failed'], 400);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemCategoryController extends Controller
{
    public function index(Request $request)
    {
        return ItemCategory::where("active", true)
            ->withCount(['items as items'])
            ->orderBy('updated_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => "required|max:255|unique:item_categories,name"
        ]);

        $category = new ItemCategory($validated);
        $category->save();
        return response()->json(['message' => 'Category created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, ItemCategory $itemCategory)
    {
        if ($itemCategory['active'] === false) {
            return response()->json(['message' => "Category does not exists"], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'name' => "required|max:255|unique:item_categories,name"
        ]);

        $itemCategory->update($validated);
        return response()->json(['message' => "Category updated successfully"]);
    }

    public function destroy(Request $request, ItemCategory $itemCategory)
    {
        if ($itemCategory['active'] === false) {
            return response()->json(['message' => "Category does not exists"], Response::HTTP_NOT_FOUND);
        }

        $count = $itemCategory->items()->count();
        if ($count !== 0) {
            return response()->json(['message' => "Category is not empty"], Response::HTTP_BAD_REQUEST);
        }

        $itemCategory->update(['active' => false]);
        return response()->json(['message' => "Category deleted successfully"]);
    }

    public function install(Request $request)
    {
        $categories = ItemCategory::where('active', true)->select('id', 'name')->get();

        $content = $categories->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemCollection;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        // $query = Item::query();

        // if ($request->has('category_id')) {
        //     $query->where('category_id', $request->input('category_id'));
        //     return $query->get();
        // }

        return new ItemCollection(Item::where('active', true)->paginate());
    }

    public function show(Request $request, Item $item)
    {
        return $item;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'name' => "required|max:255",
            'summary' => 'sometimes',
            'embeddedImage' => 'sometimes',
            'openingParagraph' => 'required',
            'closingParagraph' => 'required'
        ]);

        $item = new Item($validated);
        $item->save();
        return response()->json(['message' => 'Item created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, Item $item)
    {
        if ($item['active'] === false) {
            return response()->json(['message' => "Library item does not exists"], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:item_categories,id',
            'name' => "sometimes|max:255",
            'summary' => 'sometimes',
            'embeddedImage' => 'sometimes',
            'openingParagraph' => 'sometimes',
            'closingParagraph' => 'sometimes'
        ]);

        $item->update($validated);
        return response()->json(['message' => 'Item updated successfully']);
    }

    public function destroy(Request $request, Item $item)
    {
        if ($item['active'] === false) {
            return response()->json(['message' => "Library item does not exists"], Response::HTTP_NOT_FOUND);
        }

        $item->update(['active' => false]);
        return response()->json(['message' => 'Item deleted successfully']);
    }
}

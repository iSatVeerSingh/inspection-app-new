<?php

namespace App\Http\Controllers;

use App\Http\Resources\FullItemResource;
use App\Http\Resources\ItemCollection;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $items = Item::where('active', true);

        if ($request->has('category_id')) {
            $items->where('category_id', $request->category_id);
        }
        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $items->where('name', 'like', '%' . $keyword . '%')
                ->orWhere('summary', 'like', '%' . $keyword . '%');
        }

        return new ItemCollection($items->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function show(Request $request, Item $item)
    {
        if (Auth::user()['role'] === "Inspector") {
            return new ItemResource($item);
        }

        return new FullItemResource($item);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'name' => "required|max:255",
            'summary' => 'sometimes',
            'embeddedImage' => 'sometimes',
            'openingParagraph' => 'required',
            'closingParagraph' => 'required',
            'height' => 'required'
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
            'closingParagraph' => 'sometimes',
            'height' => 'sometimes',
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

    public function install(Request $request)
    {
        $items = Item::where('active', true)->get();

        $itemCollection = new ItemCollection($items);
        $content = $itemCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }
}

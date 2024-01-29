<?php

namespace App\Http\Controllers;

use App\Http\Resources\FullItemResource;
use App\Http\Resources\InspectorItemSummaryResource;
use App\Http\Resources\ItemCollection;
use App\Http\Resources\ItemResource;
use App\Mail\ItemSuggestion;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $items = Item::query();

        if ($request->has('category_id')) {
            $items->where('category_id', $request->category_id);
        }
        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $items->where('name', 'like', '%' . $keyword . '%');
        }

        return new ItemCollection($items->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function show(Request $request, Item $item)
    {
        return new FullItemResource($item);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'name' => "required|unique:items,name|max:255",
            'summary' => 'required',
            'openingParagraph' => 'required',
            'closingParagraph' => 'required',
            'embeddedImages' => 'sometimes',
            'embeddedImagePlace' => 'sometimes',
            'height' => 'required'
        ]);

        $item = new Item($validated);
        $item->save();
        return response()->json(['message' => 'Item created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:item_categories,id',
            'name' => "sometimes|unique:items,name|max:255",
            'summary' => 'sometimes',
            'openingParagraph' => 'sometimes',
            'closingParagraph' => 'sometimes',
            'embeddedImages' => 'sometimes',
            'embeddedImagePlace' => 'sometimes',
            'height' => 'sometimes'
        ]);

        $item->update($validated);
        return response()->json(['message' => 'Item updated successfully']);
    }

    public function destroy(Request $request, Item $item)
    {
        $item->delete();
        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function install(Request $request)
    {
        $items = Item::all();

        $itemCollection = InspectorItemSummaryResource::collection($items);
        $content = $itemCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }

    public function suggestItem(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|max:255',
            'name' => 'required|unique:items,name',
            'summary' => 'required',
            'openingParagraph' => 'required',
            'closingParagraph' => 'required',
            'embeddedImages' => 'sometimes|required'
        ]);

        $user = Auth::user();

        $sentMail = Mail::to('mail.satveer@gmail.com')->send(new ItemSuggestion($validated, $user['first'] . " " . $user['last']));

        if (!$sentMail) {
            return response()->json(['message' => 'Couln\'t send suggestion. Something went wrong'], Response::HTTP_BAD_REQUEST);
        }

        return response()->json(['message' => 'Suggestion sent successfully']);
    }
}

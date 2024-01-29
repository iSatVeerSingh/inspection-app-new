<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecommendationCollection;
use App\Models\Recommendation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $recommendations = Recommendation::query();

        return new RecommendationCollection($recommendations->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|unique:recommendations,text'
        ]);

        $recommendation = new Recommendation($validated);
        $recommendation->save();

        return response()->json(['message' => 'Recommendation created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, Recommendation $recommendation)
    {
        $validated = $request->validate([
            'text' => 'required|unique:recommendations,text'
        ]);

        $recommendation->update($validated);

        return response()->json(['message' => 'Recommendation updated successfully']);
    }

    public function destroy(Request $request, Recommendation $recommendation)
    {
        $recommendation->delete();

        return response()->json(["message" => "Recommendation deleted successfully"]);
    }

    public function install(Request $request)
    {
        $recommendations = Recommendation::select('id', 'text')->get();

        $content = $recommendations->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }
}

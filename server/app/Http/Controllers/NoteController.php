<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        return Note::where('active', true)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required',
            'category_id' => 'sometimes|exists:job_categories,id'
        ]);

        $note = new Note($validated);
        $note->save();
        return response()->json(['message' => 'Note created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, Note $note)
    {
        if ($note['active'] === false) {
            return response()->json(['message' => 'Note does not exists'], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'text' => 'required',
            'category_id' => 'sometimes'
        ]);

        $note->update($validated);
        return $note;
    }

    public function destroy(Request $request, Note $note)
    {
        if ($note['active'] === false) {
            return response()->json(['message' => 'Note does not exists'], Response::HTTP_NOT_FOUND);
        }

        $note->update(['active' => false]);
        return response()->json(["message" => "Note deleted successfully"]);
    }
}

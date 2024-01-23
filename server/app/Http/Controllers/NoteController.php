<?php

namespace App\Http\Controllers;

use App\Http\Resources\NoteCollection;
use App\Mail\NoteSuggestion;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $notes = Note::where('active', true);

        if ($request->has('category_id')) {
            $notes->where('category_id', $request->category_id);
        }

        return $notes->orderBy('updated_at', 'desc')->get();
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

    public function install(Request $request)
    {
        $notes = Note::where('active', true)->get();
        $noteCollection = new NoteCollection($notes);
        $content = $noteCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }

    public function suggestNote(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required',
            'text' => 'required'
        ]);

        // $user = Auth::user();

        $sentmail = Mail::to('mail.satveer@gmail.com')->send(new NoteSuggestion($validated['category'], $validated['text'], "Demo User"));

        if (!$sentmail) {
            return response()->json(['message' => 'Couln\'t send suggestion. Something went wrong'], Response::HTTP_BAD_REQUEST);
        }

        return response()->json(['message' => 'Suggestion sent successfully']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return User::where('active', true)
            ->orderBy('updated_at', 'desc')
            ->get();
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'sometimes|required|max:15|unique:users,phone',
            'role' => 'required|in:Inspector,Admin,Owner',
            'password' => 'required'
        ]);

        $user = new User($validated);
        $user->save();

        return response()->json(['message' => 'User created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, User $user)
    {
        if ($user['active'] === false) {
            return response()->json(['message' => 'User does not exist'], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email',
            'phone' => 'sometimes|max:15|unique:users,phone',
            'role' => 'sometimes|in:Inspector,Admin,Owner',
            'password' => 'sometimes|required'
        ]);

        $user->update($validated);
        return response()->json(['message' => 'User updated successfully']);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user['active'] === false) {
            return response()->json(['message' => 'User does not exist'], Response::HTTP_NOT_FOUND);
        }

        if (Auth::id() === $user['id'] || $user['role'] === "Owner") {
            return response()->json(['message' => 'Owner can not be deleted'], Response::HTTP_BAD_REQUEST);
        }

        $user->update(['active' => false]);
        return response()->json(['message' => 'User deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($validated)) {
            $user = User::where('email', $validated['email'])->first();
            $user->tokens()->delete();

            return response()->json([
                'access_token' => $user->createToken('api_token')->plainTextToken,
                'token_type' => 'Bearer',
                'role' => $user['role'],
                'email' => $user['email'],
                'name' => $user['first'] . " " . $user['last']
            ]);
        }

        return response()->json([
            'message' => 'Invalid Credentials',
        ], Response::HTTP_UNAUTHORIZED);
    }
}

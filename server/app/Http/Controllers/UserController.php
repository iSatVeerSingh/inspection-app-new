<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return User::orderBy('updated_at', 'desc')
            ->get();
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'first' => 'required|max:255',
            'last' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'sometimes|required|max:15|unique:users,phone',
            'role' => 'required|in:Inspector,Admin,Owner',
            'password' => 'required'
        ]);

        // Get staff memebers from servicem8 and create users
        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $body = [
            'first' => $validated['first'],
            'last' => $validated['last'],
            'email' => $validated['email'],
            'job_title' => $validated['role']
        ];

        if (array_key_exists('phone', $validated)) {
            $body['mobile'] = $validated['phone'];
        }


        $response = Http::withBasicAuth($username, $password)->post($servicem8Url . '/staff.json', $body);
        $resStatus = $response->status();
        if ($resStatus !== 200) {
            return response()->json(['message' => "Invalid request"], Response::HTTP_BAD_REQUEST);
        }

        $serviceUUID = $response->header('x-record-uuid');

        $user = new User($validated);
        $user['id'] = $serviceUUID;
        $user->save();

        return response()->json(['message' => 'User created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first' => 'sometimes|required|max:255',
            'last' => 'sometimes|required|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email',
            'phone' => 'sometimes|max:15|unique:users,phone',
            'role' => 'sometimes|in:Inspector,Admin,Owner',
            'password' => 'sometimes|required'
        ]);

        $user->update($validated);

        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $body = [
            'first' => $user['first'],
            'last' => $user['last'],
            'email' => $user['email'],
            'job_title' => $user['role'],
        ];

        if ($user['phone'] !== null) {
            $body['mobile'] = $user['phone'];
        }

        $response = Http::withBasicAuth($username, $password)->post($servicem8Url . "/staff/" . $user['id'] . '.json', $body);
        $resStatus = $response->status();
        if ($resStatus !== 200) {
            return response()->json(['message' => "Invalid request"], Response::HTTP_BAD_REQUEST);
        }


        return response()->json(['message' => 'User updated successfully']);
    }

    public function destroy(Request $request, User $user)
    {
        if (Auth::id() === $user['id'] || $user['role'] === "Owner") {
            return response()->json(['message' => 'Owner can not be deleted'], Response::HTTP_BAD_REQUEST);
        }

        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $response = Http::withBasicAuth($username, $password)->delete($servicem8Url . "/staff/" . $user['id'] . '.json');

        $resStatus = $response->status();
        if ($resStatus !== 200) {
            return response()->json(['message' => "Invalid request"], Response::HTTP_BAD_REQUEST);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}

<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\JobCategoryController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Route::post('/login', [AuthController::class, 'login']);
// Route::middleware('auth:sanctum')->group(function () {
//   Route::apiResource('/notes', NoteController::class)->except(['show']);
// });

// Route::get('/install-categories', [ItemCategoryController::class, 'install']);
// Route::get('/install-notes', [NoteController::class, 'install']);

Route::apiResource('/users', UserController::class)->except(['show']);
Route::apiResource('/job-categories', JobCategoryController::class)->except(['show']);
Route::apiResource('/item-categories', ItemCategoryController::class)->except(['show']);
Route::apiResource('/items', ItemController::class);
Route::apiResource('/recommendations', RecommendationController::class)->except(['show']);

Route::get('/install-items', [ItemController::class, 'install']);
Route::get('/install-recommendations', [RecommendationController::class, 'install']);

Route::post('/suggest-note', [NoteController::class, 'suggestNote']);

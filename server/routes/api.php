<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\JobCategoryController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsOwner;
use App\Http\Middleware\EnsureUserIsOwnerOrAdmin;
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

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
  // only the owner can create/edit/delete users
  Route::apiResource('/users', UserController::class)->except(['show'])->middleware(EnsureUserIsOwner::class);

  Route::middleware(EnsureUserIsOwnerOrAdmin::class)->group(function () {
    Route::apiResource('/job-categories', JobCategoryController::class)->except(['show']);
    Route::apiResource('/notes', NoteController::class)->except(['show']);
    Route::apiResource('/item-categories', ItemCategoryController::class)->except(['show']);
    Route::apiResource('/items', ItemController::class);
    Route::apiResource('/recommendations', RecommendationController::class)->except(['show']);
  });

  Route::get('/install-notes', [NoteController::class, 'install']);
  Route::get('/install-categories', [ItemCategoryController::class, 'install']);
  Route::get('/install-items', [ItemController::class, 'install']);
  Route::get('/install-recommendations', [RecommendationController::class, 'install']);
  Route::get('/install-job-categories', [JobCategoryController::class, 'install']);
  Route::get('/install-jobs', [JobController::class, 'syncJobs']);

  Route::post('/suggest-note', [NoteController::class, 'suggestNote']);
  Route::post('/suggest-item', [ItemController::class, 'suggestItem']);

  Route::get('/company', [CompanyController::class, 'index']);

  Route::put('/company', [CompanyController::class, 'update'])->middleware(EnsureUserIsOwner::class);

  Route::post('/sync-inspection-items', [JobController::class, 'syncInspectionItems']);
  Route::get('/sync-jobs', [JobController::class, 'syncJobs']);
  Route::post('/finish-report', [JobController::class, 'finishReport']);
});

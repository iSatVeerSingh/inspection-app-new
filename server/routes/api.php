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
use App\Http\Resources\InspectorItemSummaryResource;
use App\Http\Resources\InspectorNoteResource;
use App\Http\Resources\ItemCollection;
use App\Mail\ReportCompleted;
use App\Models\InspectionItem;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\Note;
use App\Models\Recommendation;
use App\Models\Report;
use App\Utils\ReportPdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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

  Route::post('/suggest-note', [NoteController::class, 'suggestNote']);
  Route::post('/suggest-item', [ItemController::class, 'suggestItem']);

  Route::get('/company', [CompanyController::class, 'index']);

  Route::put('/company', [CompanyController::class, 'update'])->middleware(EnsureUserIsOwner::class);

  Route::post('/sync-inspection-items', [JobController::class, 'syncInspectionItems']);
  Route::get('/sync-jobs', [JobController::class, 'syncJobs']);
  Route::get('/sync-library', [ItemController::class, 'syncLibrary']);
  Route::post('/finish-report', [JobController::class, 'finishReport']);
  Route::put('/jobs', [JobController::class, 'updateJob']);
  Route::get('/previous-report/{customerId}', [JobController::class, 'previousJobByCustomer']);
});

Route::get('/report/{reportId}/{pdfname}', [JobController::class, 'getReportPdf']);

Route::get('/demo', function (Request $request) {


  if (!$request->has('lastSync')) {
    return response()->json(['message' => 'Invalid request'], 400);
  }
  $lastSync = $request->lastSync;
  $items = Item::where('updated_at', '>=', $lastSync)->get();
  $libraryItems = InspectorItemSummaryResource::collection($items);

  $itemCategories = ItemCategory::where('updated_at', '>=', $lastSync)->select('id', 'name')->get();
  $notes = Note::where('updated_at', '>=', $lastSync)->get();
  $notesCollection = InspectorNoteResource::collection($notes);

  $recommendations = Recommendation::where('updated_at', '>=', $lastSync)->select('id', 'text')->get();

  $jobCategories = JobCategory::where('updated_at', '>=', $lastSync)->select('id', 'name')->get();

  return [
    'items' => $libraryItems,
    'categories' => $itemCategories,
    'notes' => $notesCollection,
    'recommendations' => $recommendations,
    'jobCategories' => $jobCategories
  ];
});

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
use App\Models\InspectionItem;
use App\Models\Job;
use App\Models\Report;
use App\Utils\ReportPdf;
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


Route::get('/demo-pdf', function () {
  $currentJob = Job::find('5cf683cf-f582-4216-9ff4-20f72d2ed90b');

  $report = Report::find('91405a07-e45b-4ef6-af2a-4cfcdda9d926');
  // $report = Report::find($reportId);
  // $report->update([
  //     'inspectionNotes' => $inspectionNotes,
  //     'recommendation' => $recommendation,
  // ]);

  $pdf = new ReportPdf("P", 'pt');
  $pdf->MakePdf($currentJob, $report);
  $pdfFile = $pdf->Output("", "S");

  $base64 = base64_encode($pdfFile);

  $report->update(['pdf' => $base64]);

  return response(base64_decode($base64), 200, ['Content-Type' => 'application/pdf']);
});

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

  Route::post('/suggest-note', [NoteController::class, 'suggestNote']);
  Route::post('/suggest-item', [ItemController::class, 'suggestItem']);

  Route::get('/company', [CompanyController::class, 'index']);

  Route::put('/company', [CompanyController::class, 'update'])->middleware(EnsureUserIsOwner::class);

  Route::post('/sync-inspection-items', [JobController::class, 'syncInspectionItems']);
  Route::get('/sync-jobs', [JobController::class, 'syncJobs']);
  Route::post('/finish-report', [JobController::class, 'finishReport']);
  Route::get('/previous-report/{customerId}', [JobController::class, 'previousJobByCustomer']);
});

Route::get('/report/{reportId}/{pdfname}', [JobController::class, 'getReportPdf']);

Route::get('/demo', function () {
  $report = Report::find('02f8b309-331f-4a03-9099-043c5f7da2bb');
  $currentJob = Job::find('0942e4fe-d55a-41bd-8cbb-20fda2d6d2db');
  $pdf = new ReportPdf("P", 'pt');
  $pdf->MakePdf($currentJob, $report);
  $pdf->Output();

  $inspectionItems = $report->inspectionItems->map(function (InspectionItem $inspectionItem) {
    if (!$inspectionItem['library_item_id']) {
      $inspectionItem['totalHeight'] = $inspectionItem['height'];
      return $inspectionItem;
    }
    $libItem = $inspectionItem->libraryItem;
    $totalHeight = $inspectionItem['height'] + $libItem['height'];
    $inspectionItem['library_item'] = $libItem;
    $inspectionItem['totalHeight'] = $totalHeight;
    if ($inspectionItem['previousItem']) {
      $prevItem = $inspectionItem->prevReportItem;
      $allImages = [];
      array_push($allImages, ...$inspectionItem['images'], ...$prevItem['images']);
      $inspectionItem['images'] = $allImages;
    }
    return $inspectionItem;
  })->all();

  $previousItems = [];
  $newItems = [];

  foreach ($inspectionItems as $insItem) {
    if ($insItem['previousItem']) {
      array_push($previousItems, $insItem);
    } else {
      array_push($newItems, $insItem);
    }
  }

  usort($previousItems, function ($a, $b) {
    return $b->totalHeight - $a->totalHeight;
  });
  // usort($newitems, function ($a, $b) {
  //   return $b->totalHeight - $a->totalHeight;
  // });

  $maxContentHeight = 745;

  $finalPrevious = [];

  for ($i = 0; $i < count($previousItems); $i++) {
    $itemA = $previousItems[$i];

    $isAExist = array_search($itemA['id'], array_column($finalPrevious, 'id'));
    if ($isAExist) {
      continue;
    }

    $itemA['pageBreak'] = true;
    array_push($finalPrevious, [
      'id' => $itemA['id'],
      'totalHeight' => $itemA['totalHeight'],
      'pageBreak' => $itemA['pageBreak'],
      'name' => $itemA['name'],
    ]);

    if (count($itemA['images']) > 8) {
      continue;
    }

    if ($itemA['totalHeight'] > 600 && $itemA['totalHeight'] <= $maxContentHeight) {
      continue;
    }

    if ($i === count($previousItems) - 1) {
      break;
    }

    $remainingSpace = 750;
    if ($maxContentHeight >= $itemA['totalHeight']) {
      $remainingSpace = $maxContentHeight - $itemA['totalHeight'];
    } else {
      $remainingSpace = 2 * $maxContentHeight - $itemA['totalHeight'];
    }

    $secondItem = null;
    $diff = $remainingSpace;

    for ($j = $i + 1; $j < count($previousItems); $j++) {
      $itemB = $previousItems[$j];

      $isBExist = array_search($itemB['id'], array_column($finalPrevious, 'id'));
      if ($isBExist) {
        continue;
      }

      if ($itemB['totalHeight'] < $remainingSpace && $remainingSpace - $itemB['totalHeight'] < $diff) {
        $secondItem = $itemB;
        $diff = $remainingSpace - $itemB['totalHeight'];
      }
    }

    if ($secondItem) {
      $secondItem['pageBreak'] = false;
      array_push($finalPrevious, [
        'id' => $secondItem['id'],
        'totalHeight' => $secondItem['totalHeight'],
        'pageBreak' => $secondItem['pageBreak'],
        'name' => $secondItem['name']
      ]);
    }
  }

  $lastItem = array_pop($finalPrevious);
  $lastItem['pageBreak'] = false;
  array_unshift($finalPrevious, $lastItem);

  return $finalPrevious;
});

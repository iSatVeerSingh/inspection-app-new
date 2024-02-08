<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Models\InspectionItem;
use App\Models\Job;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function index(Request $request)
    {
    }

    public function syncJobs(Request $request)
    {
        $jobs = Job::where('inspector_id', Auth::id())
            ->where('status', 'Not Started')
            ->get();

        $jobCollection = new JobCollection($jobs);
        $content = $jobCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }

    public function syncInspectionItems(Request $request)
    {
        $data = $request->all();

        $jobId = $data['job_id'];
        $reportId = $data['report_id'];
        $currentJob = Job::find($jobId);

        $currentJob->update(['status' => 'In Progress']);

        $report = Report::find($reportId);

        if (!$report) {
            $report = new Report([
                'id' => $reportId,
                'job_id' => $jobId,
                'customer_id' => $currentJob->customer->id
            ]);

            $report->save();
        }

        $deletedItems = $data['deletedItems'];
        if (is_array($deletedItems) && count($deletedItems) > 0) {
            InspectionItem::destroy($deletedItems);
        }

        $inspectionItems = $data['inspectionItems'];

        $createdInspectionItems = [];

        foreach ($inspectionItems as $inspectionItem) {
            if (!InspectionItem::find($inspectionItem['id'])) {
                $newItem = new InspectionItem([
                    'id' => $inspectionItem['id'],
                    'name' => $inspectionItem['name'],
                    'images' => $inspectionItem['images'],
                    'note' => $inspectionItem['note'],
                ]);

                $newItem['report_id'] = $report->id;

                if (array_key_exists('library_item_id', $inspectionItem)) {
                    $newItem['library_item_id'] = $inspectionItem['library_item_id'];
                }
                if (array_key_exists('height', $inspectionItem)) {
                    $newItem['height'] = $inspectionItem['height'];
                }

                if ($inspectionItem['custom'] === 1) {
                    $newItem['custom'] = true;
                }

                if ($inspectionItem['previousItem'] === 1) {
                    $newItem['previousItem'] = true;
                }

                if (array_key_exists('openingParagraph', $inspectionItem)) {
                    $newItem['openingParagraph'] = $inspectionItem['openingParagraph'];
                }
                if (array_key_exists('closingParagraph', $inspectionItem)) {
                    $newItem['closingParagraph'] = $inspectionItem['closingParagraph'];
                }

                if (array_key_exists('embeddedImage', $inspectionItem)) {
                    $newItem['embeddedImage'] = $inspectionItem['embeddedImage'];
                }

                $newItem->save();

                array_push($createdInspectionItems, $inspectionItem['id']);
            }
        }

        return response()->json($createdInspectionItems, Response::HTTP_CREATED);
    }

    public function finishReport(Request $request)
    {
        $data = $request->all();

        $jobId = $data['job_id'];
        $reportId = $data['report_id'];
        $inspectionNotes = $data['inspectionNotes'];
        $recommendation = $data['recommendation'];

        $currentJob = Job::find($jobId);

        $report = Report::find($reportId);

        $report->update([
            'inspectionNotes' => $inspectionNotes,
            'recommendation' => $recommendation
        ]);

        return ['message' => 'report finished successfully'];



        // if (!$report) {
        //     $report = new Report([
        //         'id' => $reportId,
        //         'job_id' => $jobId,
        //         'customer_id' => $currentJob->customer->id,
        //         'inspectionNotes' => $inspectionNotes,
        //         'recommendation' => $recommendation
        //     ]);

        //     $report->save();
        // }
    }
}

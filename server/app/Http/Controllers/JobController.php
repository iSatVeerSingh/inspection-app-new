<?php

namespace App\Http\Controllers;

use App\Http\Resources\InspectionItemLibraryResource;
use App\Http\Resources\JobCollection;
use App\Mail\ReportCompleted;
use App\Models\InspectionItem;
use App\Models\Job;
use App\Models\Report;
use App\Utils\ReportPdf;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class JobController extends Controller
{
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

    public function previousJobByCustomer(Request $request, string $customerId)
    {
        $report = Report::where('customer_id', $customerId)->whereNotNull('completedAt')->orderBy('updated_at', 'desc')->first();
        if (!$report) {
            return response()->json(['message' => 'No report found for this customer'], Response::HTTP_NOT_FOUND);
        }
        $inspectionItems = InspectionItemLibraryResource::collection($report->inspectionItems)->toArray($request);

        $reportData = [
            "id" => $report['id'],
            "completedAt" => $report['completedAt']->format('Y-m-d h:i A'),
            "customer_id" => $report['customer_id'],
            "category" => $report->job->category['name'],
            "previousJob" => $report->job['jobNumber'],
            "inspectionItems" => $inspectionItems
        ];

        $content = json_encode($reportData);
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

                if (array_key_exists('previous_item_id', $inspectionItem)) {
                    $newItem['previous_item_id'] = $inspectionItem['previous_item_id'];
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

    public function updateJob(Request $request)
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
        return response()->json(['message' => 'Job updated successfully']);
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
            'recommendation' => $recommendation,
        ]);

        $pdf = new ReportPdf("P", 'pt');
        $pdf->MakePdf($currentJob, $report);
        $pdfFile = $pdf->Output("", "S");



        $base64 = base64_encode($pdfFile);

        $report->update(['pdf' => $base64]);

        $user = Auth::user();

        $sentMail = Mail::to('developer.satveer@gmail.com')->send(new ReportCompleted(base64_decode($base64), $currentJob, $user['first'] . " " . $user['last']));
        if (!$sentMail) {
            return response()->json(['message' => 'Couln\'t send pdf. Something went wrong'], Response::HTTP_BAD_REQUEST);
        }

        $completedAt = new DateTime();

        $report->update(['completedAt' => $completedAt]);
        $currentJob->update(['status' => 'Completed', 'completedAt' => $completedAt]);
        // $$currentJob->update(['status' => 'Completed', 'completedAt' => $completedAt]);

        return response()->json([
            'message' => "Report generated successfully",
            'report_id' => $report['id'],
            'name' => $currentJob->category['type'] . " - Inspection Report - " . $currentJob->customer['nameOnReport'],
            'completedAt' => $completedAt
        ]);
    }

    public function getReportPdf(string $reportId, string $pdfname)
    {
        $report = Report::find($reportId);
        if (!$report) {
            return response()->json(['message' => "Report not found"], Response::HTTP_BAD_REQUEST);
        }

        $pdfblob = base64_decode($report['pdf']);

        return response($pdfblob, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $pdfname . '"',
        ]);
    }
}

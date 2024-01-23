<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function index(Request $request)
    {
    }

    public function install(Request $request)
    {
        $jobs = Job::where('active', true)
            ->where('inspector_id', Auth::id())
            ->where('status', 'Not Started')
            ->get();

        $jobCollection = new JobCollection($jobs);
        $content = $jobCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }
}

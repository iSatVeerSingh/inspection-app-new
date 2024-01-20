<?php

namespace App\Http\Controllers;

use App\Models\JobCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class JobCategoryController extends Controller
{
    public function index(Request $request)
    {
        return JobCategory::where('active', true)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|max:255|unique:job_categories,name',
            'type' => 'required|max:255|unique:job_categories,type',
            'stageOfWorks' => 'required|max:255'
        ]);

        $jobCategory = new JobCategory($validated);
        $jobCategory->save();

        return response()->json(['message' => 'Job category created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, JobCategory $jobCategory)
    {
        if ($jobCategory['active'] === false) {
            return response()->json(['message' => 'Job category does not exist'], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|max:255|unique:job_categories,name',
            'type' => 'sometimes|required|max:255|unique:job_categories,type',
            'stageOfWorks' => 'sometimes|max:255'
        ]);

        $jobCategory->update($validated);
        return response()->json(['message' => 'Job category updated successfully']);
    }

    public function destroy(Request $request, JobCategory $jobCategory)
    {
        if ($jobCategory['active'] === false) {
            return response()->json(['message' => 'Job category does not exist'], Response::HTTP_NOT_FOUND);
        }

        $count = $jobCategory->notes()->count();
        if ($count !== 0) {
            return response()->json(['message' => "Job Category is not empty"]);
        }

        $jobCategory->update(['active' => false]);
        return response()->json(['message' => 'Job category deleted successfully']);
    }
}

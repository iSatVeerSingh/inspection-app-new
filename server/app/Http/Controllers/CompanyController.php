<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        return Company::first();
    }

    public function update(Request $request, string $companyId)
    {
        return ['helo' => $companyId];
    }
}

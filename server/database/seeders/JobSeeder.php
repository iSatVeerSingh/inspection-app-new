<?php

namespace Database\Seeders;

use App\Models\JobCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        // Categories for jobs
        $categories = Http::withBasicAuth($username, $password)
            ->get($servicem8Url . "/category.json?%24filter=active%20eq%20'1'")
            ->json();

        foreach ($categories as $category) {
            $jobCategory = new JobCategory([
                'id' => $category['uuid'],
                'name' => $category['name'],
            ]);

            $jobCategory->save();
        }
    }
}

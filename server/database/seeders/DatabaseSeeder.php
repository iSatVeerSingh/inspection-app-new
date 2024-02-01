<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Company;
use App\Models\Job;
use DateTime;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $date = '2024-01-30 05:30 AM';

        $jobs = Job::where('inspector_id', '534d665c-558d-4e02-9812-1fd04aa05ceb');
        $jobs->where('updated_at', '>=', $date);
        $jobs->where('status', 'Not Started');
        dump($jobs->get());
        return;


        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        $company = new Company([
            'name' => "Correct Inspections",
            'email' => 'admin@correctinspections.com.au',
            'phone' => '(03)94341120',
            'website' => 'www.correctinspections.com.au',
            'addressLine1' => 'P.O. Box 22',
            'addressLine2' => 'Greensborough VIC 3088',
            'city' => 'Greensborough',
            'country' => 'Australia',
        ]);

        $company->save();


        $seeders = [
            'UserSeeder',
            'JobSeeder',
            'ItemSeeder',
            // 'NoteSeeder',
            // 'RecommendationsSeeder',
            // 'OldJobsSeeder'
        ];

        foreach ($seeders as $key => $seeder) {
            dump('Running: ' . $seeder);
            Artisan::call('db:seed', [
                '--class' => $seeder
            ]);
        }
    }
}

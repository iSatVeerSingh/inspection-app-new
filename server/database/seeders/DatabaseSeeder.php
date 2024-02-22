<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Company;
use App\Models\Job;
use App\Models\JobCategory;
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

        $jobCategories = [
            'Post-Slab Inspection' => ['POST-SLAB', 'After the concrete slab has been poured.'],
            'Handover Inspection' => ['HANDOVER', 'Approaching completion.'],
            'Maintenance Inspection' => ['MAINTENANCE & WARRANTY', 'Maintenance/Warranty stage, after settlement.'],
            'Pre-Plaster Inspection' => ['PRE-PLASTER', 'Approaching lock-up stage.'],
            'Waterproofing Inspection' => ['WATERPROOFING', 'Approaching fixing stage.'],
            'Fixing Inspection' => ['FIXING', 'Approaching fixing stage.'],
            'Lock-up Inspection' => ['LOCK-UP', 'Approaching lock-up stage.'],
            'Reinspection' => ['REINSPECTION', 'Reinspection'],
            'Frame Inspection' => ['FRAME', 'Approaching frame stage.'],
            'Point In Time Inspection' => ['POINT IN TIME', 'A point in time not necessarily aligning with a building contract stage.'],
            'Pre-Slab Inspection' => ['PRE-SLAB', 'Prior to the concrete slab pour.']
        ];

        foreach ($jobCategories as $key => $category) {
            $jc = JobCategory::where('name', $key)->first();
            if ($jc) {
                $jc->update(['type' => $category[0], 'stageOfWorks' => $category[1]]);
            }
        }
        return;


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

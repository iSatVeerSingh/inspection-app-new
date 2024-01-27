<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Company;
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

<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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

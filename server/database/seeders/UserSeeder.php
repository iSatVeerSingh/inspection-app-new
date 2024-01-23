<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get staff memebers from servicem8 and create users
        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $staffMembers = Http::withBasicAuth($username, $password)
            ->get($servicem8Url . "/staff.json?%24filter=active%20eq%20'1'")
            ->json();

        foreach ($staffMembers as $key => $staff) {
            $role = "";

            if (str_contains(strtolower($staff['job_title']), "admin")) {
                $role = "Admin";
            }
            if (str_contains(strtolower($staff['job_title']), "director")) {
                $role = "Owner";
            }
            if (str_contains(strtolower($staff['job_title']), "inspector")) {
                $role = "Inspector";
            }

            if ($role !== "") {
                $user = new User();
                $user['id'] = $staff['uuid'];
                $user['first'] = trim($staff['first']);
                $user['last'] = trim($staff['last']);
                $user['email'] = $staff['email'];
                if ($staff['mobile'] !== "") {
                    $user['phone'] = $staff['mobile'];
                }
                $user['password'] = trim(strtolower($staff['first'])) . "0099";
                $user['role'] = $role;

                $user->save();
            }
        }
    }
}

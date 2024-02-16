<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allitems = Storage::json('libraryitems.json');

        $allCategories = array_map(function ($item) {
            return $item['category'];
        }, $allitems);

        $uniqueCategories = array_unique($allCategories);

        foreach ($uniqueCategories as $category) {
            $itemCategory = new ItemCategory([
                "name" => trim($category)
            ]);

            $itemCategory->save();
        }

        foreach ($allitems as $item) {

            $category = ItemCategory::where('name', $item['category'])->first();

            $libItem = new Item();
            $libItem['category_id'] = $category['id'];
            $libItem['name'] = $item['name'];
            $libItem['summary'] = $item['summary'];
            $libItem['openingParagraph'] = $item['openingParagraph'];
            $libItem['closingParagraph'] = $item['closingParagraph'];
            $libItem['height'] = $item['height'];
            $libItem['embeddedImages'] = $item['embeddedImages'];

            $libItem->save();
        }
    }
}

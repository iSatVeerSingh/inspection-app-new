<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $customer = $this->customer;

        $job = [
            "id" => $this['id'],
            "jobNumber" => $this['jobNumber'],
            "category_id" => $this['category_id'],
            "category" => $this->category['name'],
            "customer" => [
                "id" => $customer['id'],
                "nameOnReport" => $customer["nameOnReport"],
                "name" => $customer["name"],
                "email" => $customer["email"],
                "phone" => $customer["phone"],
                "builderEmail" => $customer['builderEmail'],
                "supervisorEmail" => $customer['supervisorEmail'],
            ],
            "siteAddress" => $this['siteAddress'],
            "startsAt" => $this['startsAt'] === null ? null : $this['startsAt']->format('Y-m-d h:i A'),
            "status" => $this['status'],
            "completedAt" => $this['completedAt'] === null ? null : $this['completedAt']->format('Y-m-d h:i A'),
            "description" => $this["description"],
            "inspector" => $this->inspector['name'],
            "inspector_id" => $this['inspector_id'],
            "type" => $this->category['type'],
            "stageOfWorks" => $this->category['stageOfWorks']
        ];

        // if ($request->query('items') === 'true') {
        //     $inspectionItems = $this->inspectionItems()
        //         ->where('active', true)->get()
        //         ->map(function (InspectionItem $inspectionItem) {
        //             $libraryItemCategory = LibraryItem::find($inspectionItem['library_item_id'])->category['name'];
        //             $inspectionItem['category'] = $libraryItemCategory;
        //             return $inspectionItem;
        //         });

        //     $job['inspectionItems'] = $inspectionItems;
        // }

        return $job;
    }
}

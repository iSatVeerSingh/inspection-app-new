<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectorItemSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        $item = [
            "id" => $this['id'],
            "category_id" => $this['category_id'],
            "name" => $this['name'],
            "summary" => $this['summary'],
            "embeddedImages" => $this['embeddedImages'],
            "category" => $this->category['name'],
        ];

        return $item;
    }
}

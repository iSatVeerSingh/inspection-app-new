<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $item = [
            "id" => $this['id'],
            "category_id" => $this['category_id'],
            "name" => $this['name'],
            "summary" => $this['summary'],
            "embeddedImage" => $this['embeddedImage'],
            "created_at" => $this['created_at']->format('Y-m-d h:i A'),
            "updated_at" => $this['updated_at']->format('Y-m-d h:i A'),
            "category" => $this->category['name'],
        ];
        return $item;
    }
}

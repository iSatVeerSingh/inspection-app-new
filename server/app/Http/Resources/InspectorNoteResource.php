<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectorNoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        $note = [
            "id" => $this['id'],
            "category_id" => $this['category_id'],
            "text" => $this['text'],
            "category" => $this->jobCategory['name'],
        ];
        return $note;
    }
}

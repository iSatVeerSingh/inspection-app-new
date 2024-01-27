<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $note = parent::toArray($request);
        $note['category'] = $this->jobCategory['name'];
        // $note = [
        //     "id" => $this['id'],
        //     "category_id" => $this['category_id'],
        //     "text" => $this['text'],
        //     "category" => $this->jobCategory['name'],
        // ];
        return $note;
    }
}

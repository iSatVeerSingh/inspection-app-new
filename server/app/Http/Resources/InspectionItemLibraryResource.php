<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectionItemLibraryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            "id" => $this->id,
            "name" => $this->name,
            "report_id" => $this->report_id,
            "images" => $this->images,
            "note" => $this->note,
            "height" => $this->height,
        ];

        if($this->custom) {
            $data['openingParagraph'] = $this->openingParagraph;
            $data['closingParagraph'] = $this->closingParagraph;
            $data['embeddedImage'] = $this->embeddedImage;
            $data['category'] = "Custom";
        } else {
            $data['library_item_id'] =  $this->library_item_id;
            $data['category'] = $this->libraryItem->category['name'];
        }

        $data['summary'] = $this->libraryItem['summary'];
        // // return parent::toArray($request);
        // $data = parent::toArray($request);
        // $data['summary'] = $this->libraryItem['summary'];
        return $data;
    }
}

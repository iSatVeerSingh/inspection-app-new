<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ItemCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    public function paginationInformation($request, $paginated, $default): array
    {
        return [
            'pages' => [
                'current_page' => $paginated['current_page'],
                'per_page' => $paginated['per_page'],
                'next' => $paginated['next_page_url'] ? $paginated['current_page'] + 1 : null,
                'prev' => $paginated['prev_page_url'] ? $paginated['current_page'] - 1 : null
            ]
        ];
    }
}

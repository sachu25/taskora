<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SprintIssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sprint_id' => $this->sprint_id,
            'position' => $this->position,
            'added_at' => $this->added_at?->toISOString(),
            'added_by' => $this->whenLoaded('addedBy', function () {
                return [
                    'id' => $this->addedBy->id,
                    'name' => $this->addedBy->name,
                    'email' => $this->addedBy->email,
                ];
            }),
            'issue' => new IssueResource($this->whenLoaded('issue')),
        ];
    }
}

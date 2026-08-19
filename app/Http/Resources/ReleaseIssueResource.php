<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReleaseIssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'release_id' => $this->release_id,
            'issue_id' => $this->issue_id,
            'added_by' => $this->added_by,
            'issue' => new IssueResource($this->whenLoaded('issue')),
            'added_by_user' => new UserResource($this->whenLoaded('addedBy')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

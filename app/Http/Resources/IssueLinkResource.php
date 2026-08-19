<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'issue_id' => $this->issue_id,
            'linked_issue' => [
                'id' => $this->linkedIssue?->id,
                'key' => $this->linkedIssue?->key,
                'title' => $this->linkedIssue?->title,
                'status' => $this->linkedIssue?->status,
                'issue_type' => $this->linkedIssue?->issue_type,
            ],
            'link_type' => $this->link_type,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

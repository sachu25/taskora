<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'issue_number' => $this->issue_number,
            'organization_id' => $this->organization_id,
            'project_id' => $this->project_id,
            'issue_type' => $this->issue_type,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'severity' => $this->severity,
            'reporter' => new UserResource($this->whenLoaded('reporter', $this->reporter)),
            'assignee' => new UserResource($this->whenLoaded('assignee', $this->assignee)),
            'parent_id' => $this->parent_id,
            'parent' => new IssueResource($this->whenLoaded('parent')),
            'children' => IssueResource::collection($this->whenLoaded('children')),
            'labels' => LabelResource::collection($this->whenLoaded('labels')),
            'watchers_count' => $this->whenCounted('watchers'),
            'comments_count' => $this->whenCounted('comments'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}

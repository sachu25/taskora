<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReleaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'project_id' => $this->project_id,
            'name' => $this->name,
            'version' => $this->version,
            'description' => $this->description,
            'status' => $this->status,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'release_date' => $this->release_date?->format('Y-m-d'),
            'released_at' => $this->released_at?->toIso8601String(),
            'created_by' => $this->created_by,
            'release_manager_id' => $this->release_manager_id,
            'issues_count' => $this->whenCounted('issues', $this->issues_count),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'release_manager' => new UserResource($this->whenLoaded('releaseManager')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,
            'key' => $this->key,
            'slug' => $this->slug,
            'description' => $this->description,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'start_date' => $this->start_date?->toDateString(),
            'target_date' => $this->target_date?->toDateString(),
            'created_by' => $this->created_by,
            'members_count' => $this->whenCounted('members'),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'members' => ProjectMemberResource::collection($this->whenLoaded('members')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

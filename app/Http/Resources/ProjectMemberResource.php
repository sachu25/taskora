<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'role' => $this->role,
            'user' => new UserResource($this->whenLoaded('user', $this->user)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

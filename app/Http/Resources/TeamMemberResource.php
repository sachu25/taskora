<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'team_id' => $this->team_id,
            'user' => new UserResource($this->whenLoaded('user', $this->user)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

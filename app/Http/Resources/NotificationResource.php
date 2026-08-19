<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'user_id' => $this->user_id,
            'project_id' => $this->project_id,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'action_url' => $this->action_url,
            'metadata' => $this->metadata,
            'read_at' => $this->read_at?->toISOString(),
            'is_read' => $this->read_at !== null,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}

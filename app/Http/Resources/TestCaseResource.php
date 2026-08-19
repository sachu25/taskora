<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'project_id' => $this->project_id,
            'suite_id' => $this->suite_id,
            'case_number' => $this->case_number,
            'key' => $this->key,
            'title' => $this->title,
            'description' => $this->description,
            'preconditions' => $this->preconditions,
            'test_type' => $this->test_type,
            'priority' => $this->priority,
            'status' => $this->status,
            'suite' => $this->whenLoaded('suite', function () {
                return [
                    'id' => $this->suite->id,
                    'name' => $this->suite->name,
                ];
            }),
            'project' => $this->whenLoaded('project', function () {
                return [
                    'id' => $this->project->id,
                    'key' => $this->project->key,
                    'name' => $this->project->name,
                ];
            }),
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'steps' => TestStepResource::collection($this->whenLoaded('steps')),
            'issues' => $this->whenLoaded('issues', function () {
                return $this->issues->map(function ($issue) {
                    return [
                        'id' => $issue->id,
                        'key' => $issue->key,
                        'title' => $issue->title,
                        'status' => $issue->status,
                        'priority' => $issue->priority,
                    ];
                });
            }),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestRunCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'test_run_id' => $this->test_run_id,
            'test_case_id' => $this->test_case_id,
            'position' => $this->position,
            'test_case' => new TestCaseResource($this->whenLoaded('testCase')),
            'execution' => new TestExecutionResource($this->whenLoaded('execution')),
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}

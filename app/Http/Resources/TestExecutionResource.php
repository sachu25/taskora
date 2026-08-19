<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestExecutionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'test_run_id' => $this->test_run_id,
            'test_case_id' => $this->test_case_id,
            'test_run_case_id' => $this->test_run_case_id,
            'status' => $this->status,
            'actual_result' => $this->actual_result,
            'notes' => $this->notes,
            'executed_at' => $this->executed_at?->toISOString(),
            'executor' => $this->whenLoaded('executor', function () {
                return $this->executor ? [
                    'id' => $this->executor->id,
                    'name' => $this->executor->name,
                    'email' => $this->executor->email,
                ] : null;
            }),
            'test_case' => new TestCaseResource($this->whenLoaded('testCase')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}

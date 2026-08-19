<?php

namespace App\Domain\QA\Actions;

use App\Models\Project;
use App\Models\TestCase;
use App\Models\TestSuite;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateTestCase
{
    public function execute(User $creator, Project $project, array $data): TestCase
    {
        if (!empty($data['suite_id'])) {
            $suite = TestSuite::where('project_id', $project->id)
                ->where('id', $data['suite_id'])
                ->first();

            if (!$suite) {
                throw ValidationException::withMessages([
                    'suite_id' => ['The selected test suite must belong to the same project.'],
                ]);
            }
        }

        return DB::transaction(function () use ($creator, $project, $data) {
            // Lock project row to safely derive next case_number without race conditions
            Project::where('id', $project->id)->lockForUpdate()->first();

            $maxNumber = TestCase::where('project_id', $project->id)
                ->withTrashed()
                ->max('case_number') ?: 0;

            $caseNumber = $maxNumber + 1;

            $testCase = TestCase::create([
                'organization_id' => $project->organization_id,
                'project_id' => $project->id,
                'suite_id' => $data['suite_id'] ?? null,
                'case_number' => $caseNumber,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'preconditions' => $data['preconditions'] ?? null,
                'test_type' => $data['test_type'] ?? 'functional',
                'priority' => $data['priority'] ?? 'medium',
                'status' => $data['status'] ?? 'ready',
                'created_by' => $creator->id,
            ]);

            ActivityLogger::log(
                $project->organization_id,
                $creator->id,
                'qa.test_case_created',
                "Created test case {$testCase->key}: '{$testCase->title}'",
                $testCase
            );

            return $testCase;
        });
    }
}

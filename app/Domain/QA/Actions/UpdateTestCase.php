<?php

namespace App\Domain\QA\Actions;

use App\Models\TestCase;
use App\Models\TestSuite;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateTestCase
{
    public function execute(User $actor, TestCase $testCase, array $data): TestCase
    {
        if (array_key_exists('suite_id', $data) && !empty($data['suite_id'])) {
            $suite = TestSuite::where('project_id', $testCase->project_id)
                ->where('id', $data['suite_id'])
                ->first();

            if (!$suite) {
                throw ValidationException::withMessages([
                    'suite_id' => ['The selected test suite must belong to the same project.'],
                ]);
            }
        }

        return DB::transaction(function () use ($actor, $testCase, $data) {
            $testCase->update([
                'suite_id' => array_key_exists('suite_id', $data) ? $data['suite_id'] : $testCase->suite_id,
                'title' => $data['title'] ?? $testCase->title,
                'description' => array_key_exists('description', $data) ? $data['description'] : $testCase->description,
                'preconditions' => array_key_exists('preconditions', $data) ? $data['preconditions'] : $testCase->preconditions,
                'test_type' => $data['test_type'] ?? $testCase->test_type,
                'priority' => $data['priority'] ?? $testCase->priority,
                'status' => $data['status'] ?? $testCase->status,
                'updated_by' => $actor->id,
            ]);

            ActivityLogger::log(
                $testCase->organization_id,
                $actor->id,
                'qa.test_case_updated',
                "Updated test case {$testCase->key}",
                $testCase
            );

            return $testCase;
        });
    }
}

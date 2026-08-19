<?php

namespace App\Domain\QA\Actions;

use App\Models\TestCase;
use App\Models\TestExecution;
use App\Models\TestRun;
use App\Models\TestRunCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddTestCaseToRun
{
    public function execute(User $actor, TestRun $run, TestCase $testCase): TestRunCase
    {
        // Boundary validation: Org and Project MUST match
        if ($testCase->organization_id !== $run->organization_id || $testCase->project_id !== $run->project_id) {
            throw ValidationException::withMessages([
                'test_case_id' => ['The test case must belong to the same project and organization as the test run.'],
            ]);
        }

        $exists = TestRunCase::where('test_run_id', $run->id)
            ->where('test_case_id', $testCase->id)
            ->first();

        if ($exists) {
            throw ValidationException::withMessages([
                'test_case_id' => ['This test case is already included in the test run.'],
            ]);
        }

        return DB::transaction(function () use ($actor, $run, $testCase) {
            $maxPosition = TestRunCase::where('test_run_id', $run->id)->max('position') ?: 0;

            $runCase = TestRunCase::create([
                'test_run_id' => $run->id,
                'test_case_id' => $testCase->id,
                'position' => $maxPosition + 1,
                'created_by' => $actor->id,
            ]);

            // Initialize default TestExecution record
            TestExecution::create([
                'organization_id' => $run->organization_id,
                'test_run_id' => $run->id,
                'test_case_id' => $testCase->id,
                'test_run_case_id' => $runCase->id,
                'status' => 'not_run',
            ]);

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_case_added_to_run',
                "Added test case {$testCase->key} to test run '{$run->name}'",
                $run,
                ['test_case_id' => $testCase->id, 'test_case_key' => $testCase->key]
            );

            return $runCase;
        });
    }
}

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

class ExecuteTestCase
{
    public function execute(User $actor, TestRun $run, TestCase $testCase, array $data): TestExecution
    {
        // 1. Run must be active
        if ($run->status !== 'active') {
            throw ValidationException::withMessages([
                'status' => ["Cannot execute tests on a run with status '{$run->status}'. Test run must be 'active'."],
            ]);
        }

        // 2. Find run case & verify relationship
        $runCase = TestRunCase::where('test_run_id', $run->id)
            ->where('test_case_id', $testCase->id)
            ->first();

        if (!$runCase) {
            throw ValidationException::withMessages([
                'test_case_id' => ['The test case does not exist in this test run.'],
            ]);
        }

        return DB::transaction(function () use ($actor, $run, $testCase, $runCase, $data) {
            $execution = TestExecution::updateOrCreate(
                ['test_run_case_id' => $runCase->id],
                [
                    'organization_id' => $run->organization_id,
                    'test_run_id' => $run->id,
                    'test_case_id' => $testCase->id,
                    'status' => $data['status'],
                    'executed_by' => $actor->id,
                    'executed_at' => now(),
                    'actual_result' => $data['actual_result'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]
            );

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_execution_completed',
                "Executed test case {$testCase->key} in run '{$run->name}' with status '{$execution->status}'",
                $run,
                [
                    'test_case_id' => $testCase->id,
                    'execution_id' => $execution->id,
                    'status' => $execution->status,
                ]
            );

            return $execution;
        });
    }
}

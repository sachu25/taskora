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

class ResetTestExecution
{
    public function execute(User $actor, TestRun $run, TestCase $testCase): TestExecution
    {
        if ($run->status !== 'active') {
            throw ValidationException::withMessages([
                'status' => ["Cannot reset test execution on a run with status '{$run->status}'. Test run must be 'active'."],
            ]);
        }

        $runCase = TestRunCase::where('test_run_id', $run->id)
            ->where('test_case_id', $testCase->id)
            ->first();

        if (!$runCase) {
            throw ValidationException::withMessages([
                'test_case_id' => ['The test case does not exist in this test run.'],
            ]);
        }

        return DB::transaction(function () use ($actor, $run, $testCase, $runCase) {
            $execution = TestExecution::updateOrCreate(
                ['test_run_case_id' => $runCase->id],
                [
                    'organization_id' => $run->organization_id,
                    'test_run_id' => $run->id,
                    'test_case_id' => $testCase->id,
                    'status' => 'not_run',
                    'executed_by' => null,
                    'executed_at' => null,
                    'actual_result' => null,
                    'notes' => null,
                ]
            );

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_execution_reset',
                "Reset execution status for test case {$testCase->key} in run '{$run->name}'",
                $run,
                ['test_case_id' => $testCase->id]
            );

            return $execution;
        });
    }
}

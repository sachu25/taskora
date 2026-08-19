<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\TestRunCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class RemoveTestCaseFromRun
{
    public function execute(User $actor, TestRun $run, TestRunCase $runCase): bool
    {
        return DB::transaction(function () use ($actor, $run, $runCase) {
            $testCaseKey = $runCase->testCase ? $runCase->testCase->key : 'Unknown';
            $runId = $run->id;

            $runCase->delete(); // Cascades execution record via DB foreign key

            // Re-sequence remaining run cases
            $remaining = TestRunCase::where('test_run_id', $runId)
                ->orderBy('position', 'asc')
                ->get();

            foreach ($remaining as $index => $rc) {
                $rc->update(['position' => $index + 1]);
            }

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_case_removed_from_run',
                "Removed test case {$testCaseKey} from test run '{$run->name}'",
                $run
            );

            return true;
        });
    }
}

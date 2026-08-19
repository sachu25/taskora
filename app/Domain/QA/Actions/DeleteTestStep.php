<?php

namespace App\Domain\QA\Actions;

use App\Models\TestStep;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class DeleteTestStep
{
    public function execute(User $actor, TestStep $step): bool
    {
        return DB::transaction(function () use ($actor, $step) {
            $testCase = $step->testCase;
            $caseId = $step->test_case_id;

            $step->delete();

            // Re-sequence remaining steps
            $remainingSteps = TestStep::where('test_case_id', $caseId)
                ->orderBy('step_number', 'asc')
                ->get();

            foreach ($remainingSteps as $index => $s) {
                $s->update(['step_number' => $index + 10000]);
            }

            foreach ($remainingSteps as $index => $s) {
                $s->update(['step_number' => $index + 1]);
            }

            if ($testCase) {
                ActivityLogger::log(
                    $testCase->organization_id,
                    $actor->id,
                    'qa.test_step_deleted',
                    "Deleted step from test case {$testCase->key}",
                    $testCase
                );
            }

            return true;
        });
    }
}

<?php

namespace App\Domain\QA\Actions;

use App\Models\TestStep;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class ReorderTestStep
{
    public function execute(User $actor, TestStep $step, int $newPosition): TestStep
    {
        return DB::transaction(function () use ($actor, $step, $newPosition) {
            $caseId = $step->test_case_id;
            $oldPosition = $step->step_number;

            if ($oldPosition === $newPosition) {
                return $step;
            }

            $otherSteps = TestStep::where('test_case_id', $caseId)
                ->where('id', '!=', $step->id)
                ->orderBy('step_number', 'asc')
                ->get();

            $reordered = collect();
            $inserted = false;

            foreach ($otherSteps as $s) {
                if ($reordered->count() + 1 === $newPosition) {
                    $reordered->push($step);
                    $inserted = true;
                }
                $reordered->push($s);
            }

            if (!$inserted) {
                $reordered->push($step);
            }

            // Offset temporarily to prevent UNIQUE(test_case_id, step_number) collision
            foreach ($reordered as $index => $s) {
                $s->update(['step_number' => $index + 10000]);
            }

            foreach ($reordered as $index => $s) {
                $s->update(['step_number' => $index + 1]);
            }

            $step->refresh();
            $testCase = $step->testCase;

            if ($testCase) {
                ActivityLogger::log(
                    $testCase->organization_id,
                    $actor->id,
                    'qa.test_step_reordered',
                    "Reordered step #{$step->step_number} in test case {$testCase->key}",
                    $testCase
                );
            }

            return $step;
        });
    }
}

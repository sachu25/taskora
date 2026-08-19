<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRunCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class ReorderTestRunCase
{
    public function execute(User $actor, TestRunCase $runCase, int $newPosition): TestRunCase
    {
        return DB::transaction(function () use ($actor, $runCase, $newPosition) {
            $runId = $runCase->test_run_id;
            $oldPosition = $runCase->position;

            if ($oldPosition === $newPosition) {
                return $runCase;
            }

            $otherCases = TestRunCase::where('test_run_id', $runId)
                ->where('id', '!=', $runCase->id)
                ->orderBy('position', 'asc')
                ->get();

            $reordered = collect();
            $inserted = false;

            foreach ($otherCases as $rc) {
                if ($reordered->count() + 1 === $newPosition) {
                    $reordered->push($runCase);
                    $inserted = true;
                }
                $reordered->push($rc);
            }

            if (!$inserted) {
                $reordered->push($runCase);
            }

            foreach ($reordered as $index => $rc) {
                $rc->update(['position' => $index + 1]);
            }

            $runCase->refresh();
            $run = $runCase->run;

            if ($run) {
                ActivityLogger::log(
                    $run->organization_id,
                    $actor->id,
                    'qa.test_case_reordered_in_run',
                    "Reordered test cases in test run '{$run->name}'",
                    $run
                );
            }

            return $runCase;
        });
    }
}

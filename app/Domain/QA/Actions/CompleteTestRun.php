<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteTestRun
{
    public function execute(User $actor, TestRun $run): TestRun
    {
        if ($run->status !== 'active') {
            throw ValidationException::withMessages([
                'status' => ["Cannot complete test run in status '{$run->status}'. Test run must be 'active'."],
            ]);
        }

        return DB::transaction(function () use ($actor, $run) {
            $run->update([
                'status' => 'completed',
                'completed_at' => now(),
                'updated_by' => $actor->id,
            ]);

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_run_completed',
                "Completed test run '{$run->name}'",
                $run
            );

            return $run;
        });
    }
}

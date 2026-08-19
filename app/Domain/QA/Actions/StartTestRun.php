<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StartTestRun
{
    public function execute(User $actor, TestRun $run): TestRun
    {
        if ($run->status !== 'planned') {
            throw ValidationException::withMessages([
                'status' => ["Cannot start test run in status '{$run->status}'. Test run must be in 'planned' status."],
            ]);
        }

        return DB::transaction(function () use ($actor, $run) {
            $run->update([
                'status' => 'active',
                'started_at' => now(),
                'updated_by' => $actor->id,
            ]);

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_run_started',
                "Started test run '{$run->name}'",
                $run
            );

            return $run;
        });
    }
}

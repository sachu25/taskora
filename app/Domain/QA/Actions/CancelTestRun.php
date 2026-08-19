<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CancelTestRun
{
    public function execute(User $actor, TestRun $run): TestRun
    {
        if ($run->status === 'completed' || $run->status === 'cancelled') {
            throw ValidationException::withMessages([
                'status' => ["Cannot cancel test run already in status '{$run->status}'."],
            ]);
        }

        return DB::transaction(function () use ($actor, $run) {
            $run->update([
                'status' => 'cancelled',
                'updated_by' => $actor->id,
            ]);

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_run_cancelled',
                "Cancelled test run '{$run->name}'",
                $run
            );

            return $run;
        });
    }
}

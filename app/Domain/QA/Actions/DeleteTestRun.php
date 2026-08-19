<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class DeleteTestRun
{
    public function execute(User $actor, TestRun $run): bool
    {
        return DB::transaction(function () use ($actor, $run) {
            $run->delete();

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_run_deleted',
                "Deleted test run '{$run->name}'",
                $run
            );

            return true;
        });
    }
}

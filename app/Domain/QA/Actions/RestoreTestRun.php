<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class RestoreTestRun
{
    public function execute(User $actor, TestRun $run): TestRun
    {
        return DB::transaction(function () use ($actor, $run) {
            $run->restore();

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_run_restored',
                "Restored test run '{$run->name}'",
                $run
            );

            return $run;
        });
    }
}

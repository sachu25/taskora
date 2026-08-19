<?php

namespace App\Domain\QA\Actions;

use App\Models\TestSuite;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class RestoreTestSuite
{
    public function execute(User $actor, TestSuite $suite): TestSuite
    {
        return DB::transaction(function () use ($actor, $suite) {
            $suite->restore();

            ActivityLogger::log(
                $suite->organization_id,
                $actor->id,
                'qa.suite_restored',
                "Restored test suite '{$suite->name}'",
                $suite
            );

            return $suite;
        });
    }
}

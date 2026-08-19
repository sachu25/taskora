<?php

namespace App\Domain\QA\Actions;

use App\Models\TestSuite;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class DeleteTestSuite
{
    public function execute(User $actor, TestSuite $suite): bool
    {
        return DB::transaction(function () use ($actor, $suite) {
            $suite->delete();

            ActivityLogger::log(
                $suite->organization_id,
                $actor->id,
                'qa.suite_deleted',
                "Deleted test suite '{$suite->name}'",
                $suite
            );

            return true;
        });
    }
}

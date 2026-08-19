<?php

namespace App\Domain\QA\Actions;

use App\Models\TestCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class DeleteTestCase
{
    public function execute(User $actor, TestCase $testCase): bool
    {
        return DB::transaction(function () use ($actor, $testCase) {
            $testCase->delete();

            ActivityLogger::log(
                $testCase->organization_id,
                $actor->id,
                'qa.test_case_deleted',
                "Deleted test case {$testCase->key}",
                $testCase
            );

            return true;
        });
    }
}

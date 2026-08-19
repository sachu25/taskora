<?php

namespace App\Domain\QA\Actions;

use App\Models\TestCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class RestoreTestCase
{
    public function execute(User $actor, TestCase $testCase): TestCase
    {
        return DB::transaction(function () use ($actor, $testCase) {
            $testCase->restore();

            ActivityLogger::log(
                $testCase->organization_id,
                $actor->id,
                'qa.test_case_restored',
                "Restored test case {$testCase->key}",
                $testCase
            );

            return $testCase;
        });
    }
}

<?php

namespace App\Domain\QA\Actions;

use App\Models\TestCase;
use App\Models\TestStep;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class AddTestStep
{
    public function execute(User $actor, TestCase $testCase, array $data): TestStep
    {
        return DB::transaction(function () use ($actor, $testCase, $data) {
            $maxStep = TestStep::where('test_case_id', $testCase->id)->max('step_number') ?: 0;
            $stepNumber = $data['step_number'] ?? ($maxStep + 1);

            $step = TestStep::create([
                'test_case_id' => $testCase->id,
                'step_number' => $stepNumber,
                'action' => $data['action'],
                'expected_result' => $data['expected_result'] ?? null,
            ]);

            ActivityLogger::log(
                $testCase->organization_id,
                $actor->id,
                'qa.test_step_added',
                "Added step #{$step->step_number} to test case {$testCase->key}",
                $testCase
            );

            return $step;
        });
    }
}

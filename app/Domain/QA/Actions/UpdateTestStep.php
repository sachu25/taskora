<?php

namespace App\Domain\QA\Actions;

use App\Models\TestStep;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class UpdateTestStep
{
    public function execute(User $actor, TestStep $step, array $data): TestStep
    {
        return DB::transaction(function () use ($actor, $step, $data) {
            $step->update([
                'action' => $data['action'] ?? $step->action,
                'expected_result' => array_key_exists('expected_result', $data) ? $data['expected_result'] : $step->expected_result,
            ]);

            $testCase = $step->testCase;
            if ($testCase) {
                ActivityLogger::log(
                    $testCase->organization_id,
                    $actor->id,
                    'qa.test_step_updated',
                    "Updated step #{$step->step_number} in test case {$testCase->key}",
                    $testCase
                );
            }

            return $step;
        });
    }
}

<?php

namespace App\Domain\QA\Actions;

use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class UpdateTestRun
{
    public function execute(User $actor, TestRun $run, array $data): TestRun
    {
        return DB::transaction(function () use ($actor, $run, $data) {
            $run->update([
                'name' => $data['name'] ?? $run->name,
                'description' => array_key_exists('description', $data) ? $data['description'] : $run->description,
                'environment' => array_key_exists('environment', $data) ? $data['environment'] : $run->environment,
                'updated_by' => $actor->id,
            ]);

            ActivityLogger::log(
                $run->organization_id,
                $actor->id,
                'qa.test_run_updated',
                "Updated test run '{$run->name}'",
                $run
            );

            return $run;
        });
    }
}

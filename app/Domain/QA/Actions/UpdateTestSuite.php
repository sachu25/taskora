<?php

namespace App\Domain\QA\Actions;

use App\Models\TestSuite;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class UpdateTestSuite
{
    public function execute(User $actor, TestSuite $suite, array $data): TestSuite
    {
        return DB::transaction(function () use ($actor, $suite, $data) {
            $suite->update([
                'name' => $data['name'] ?? $suite->name,
                'description' => array_key_exists('description', $data) ? $data['description'] : $suite->description,
                'status' => $data['status'] ?? $suite->status,
                'updated_by' => $actor->id,
            ]);

            ActivityLogger::log(
                $suite->organization_id,
                $actor->id,
                'qa.suite_updated',
                "Updated test suite '{$suite->name}'",
                $suite
            );

            return $suite;
        });
    }
}

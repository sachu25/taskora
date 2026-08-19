<?php

namespace App\Domain\QA\Actions;

use App\Models\Project;
use App\Models\TestSuite;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class CreateTestSuite
{
    public function execute(User $creator, Project $project, array $data): TestSuite
    {
        return DB::transaction(function () use ($creator, $project, $data) {
            $suite = TestSuite::create([
                'organization_id' => $project->organization_id,
                'project_id' => $project->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'active',
                'created_by' => $creator->id,
            ]);

            ActivityLogger::log(
                $project->organization_id,
                $creator->id,
                'qa.suite_created',
                "Created test suite '{$suite->name}' for project '{$project->name}'",
                $suite
            );

            return $suite;
        });
    }
}

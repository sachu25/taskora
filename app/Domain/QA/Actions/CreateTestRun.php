<?php

namespace App\Domain\QA\Actions;

use App\Models\Project;
use App\Models\TestRun;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class CreateTestRun
{
    public function execute(User $creator, Project $project, array $data): TestRun
    {
        return DB::transaction(function () use ($creator, $project, $data) {
            $run = TestRun::create([
                'organization_id' => $project->organization_id,
                'project_id' => $project->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => 'planned',
                'environment' => $data['environment'] ?? 'staging',
                'created_by' => $creator->id,
            ]);

            ActivityLogger::log(
                $project->organization_id,
                $creator->id,
                'qa.test_run_created',
                "Created test run '{$run->name}' for project '{$project->name}'",
                $run
            );

            return $run;
        });
    }
}

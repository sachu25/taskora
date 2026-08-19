<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateSprint
{
    public function execute(User $creator, Project $project, array $data): Sprint
    {
        if (!empty($data['start_date']) && !empty($data['end_date'])) {
            if ($data['end_date'] < $data['start_date']) {
                throw ValidationException::withMessages([
                    'end_date' => ['The end date cannot be earlier than the start date.'],
                ]);
            }
        }

        return DB::transaction(function () use ($creator, $project, $data) {
            $sprint = Sprint::create([
                'organization_id' => $project->organization_id,
                'project_id' => $project->id,
                'name' => $data['name'],
                'goal' => $data['goal'] ?? null,
                'status' => 'planned',
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'created_by' => $creator->id,
            ]);

            ActivityLogger::log(
                $project->organization_id,
                $creator->id,
                'sprint.created',
                "Created sprint '{$sprint->name}' for project '{$project->name}'",
                $sprint
            );

            return $sprint;
        });
    }
}

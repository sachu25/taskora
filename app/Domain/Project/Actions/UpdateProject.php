<?php

namespace App\Domain\Project\Actions;

use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class UpdateProject
{
    public function execute(User $actor, Project $project, array $data): Project
    {
        if (isset($data['key']) && strtoupper($data['key']) !== $project->key) {
            $key = strtoupper($data['key']);
            $existingKey = Project::where('organization_id', $project->organization_id)
                ->where('key', $key)
                ->where('id', '!=', $project->id)
                ->first();

            if ($existingKey) {
                throw ValidationException::withMessages([
                    'key' => ['The project key has already been taken in this organization.'],
                ]);
            }
            $data['key'] = $key;
        }

        $project->update(array_filter([
            'name' => $data['name'] ?? null,
            'key' => $data['key'] ?? null,
            'slug' => $data['slug'] ?? null,
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? null,
            'visibility' => $data['visibility'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'target_date' => $data['target_date'] ?? null,
        ], fn ($val) => !is_null($val)));

        ActivityLogger::log(
            $project->organization_id,
            $actor->id,
            'project.updated',
            "Updated project {$project->name}",
            $project
        );

        return $project;
    }
}

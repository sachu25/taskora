<?php

namespace App\Domain\Release\Actions;

use App\Models\Project;
use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateRelease
{
    public function execute(User $creator, Project $project, array $data): Release
    {
        // Date validation
        if (!empty($data['start_date']) && !empty($data['release_date'])) {
            if ($data['release_date'] < $data['start_date']) {
                throw ValidationException::withMessages([
                    'release_date' => ['The release date cannot be earlier than the start date.'],
                ]);
            }
        }

        // Project-scoped version uniqueness check
        $versionExists = Release::where('project_id', $project->id)
            ->where('version', $data['version'])
            ->exists();

        if ($versionExists) {
            throw ValidationException::withMessages([
                'version' => ['A release with this version already exists for this project.'],
            ]);
        }

        // Release Manager organization validation
        if (!empty($data['release_manager_id'])) {
            $manager = User::find($data['release_manager_id']);
            if (!$manager || !$manager->belongsToOrganization($project->organization_id)) {
                throw ValidationException::withMessages([
                    'release_manager_id' => ['The selected release manager must belong to the project organization.'],
                ]);
            }
        }

        return DB::transaction(function () use ($creator, $project, $data) {
            $release = Release::create([
                'organization_id' => $project->organization_id,
                'project_id' => $project->id,
                'name' => $data['name'],
                'version' => $data['version'],
                'description' => $data['description'] ?? null,
                'status' => 'planned',
                'start_date' => $data['start_date'] ?? null,
                'release_date' => $data['release_date'] ?? null,
                'created_by' => $creator->id,
                'release_manager_id' => $data['release_manager_id'] ?? null,
            ]);

            ActivityLogger::log(
                $project->organization_id,
                $creator->id,
                'release.created',
                "Created release '{$release->name}' ({$release->version}) for project '{$project->name}'",
                $release
            );

            return $release;
        });
    }
}

<?php

namespace App\Domain\Project\Actions;

use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateProject
{
    public function execute(User $creator, Organization $organization, array $data): Project
    {
        $key = strtoupper($data['key']);

        // Check unique key within organization
        $existingKey = Project::where('organization_id', $organization->id)
            ->where('key', $key)
            ->first();

        if ($existingKey) {
            throw ValidationException::withMessages([
                'key' => ['The project key has already been taken in this organization.'],
            ]);
        }

        $name = $data['name'];
        $slug = $data['slug'] ?? Str::slug($name);

        $existingSlug = Project::where('organization_id', $organization->id)
            ->where('slug', $slug)
            ->first();

        if ($existingSlug) {
            $slug .= '-' . Str::random(4);
        }

        return DB::transaction(function () use ($creator, $organization, $name, $key, $slug, $data) {
            $project = Project::create([
                'organization_id' => $organization->id,
                'name' => $name,
                'key' => $key,
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'active',
                'visibility' => $data['visibility'] ?? 'organization',
                'start_date' => $data['start_date'] ?? null,
                'target_date' => $data['target_date'] ?? null,
                'created_by' => $creator->id,
            ]);

            // Add creator as project_manager
            ProjectMember::create([
                'project_id' => $project->id,
                'user_id' => $creator->id,
                'role' => 'project_manager',
            ]);

            ActivityLogger::log(
                $organization->id,
                $creator->id,
                'project.created',
                "Created project {$project->name} ({$project->key})",
                $project
            );

            return $project;
        });
    }
}

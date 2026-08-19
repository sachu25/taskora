<?php

namespace App\Domain\Project\Actions;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class AddProjectMember
{
    public function execute(User $actor, Project $project, User $user, string $role = 'developer'): ProjectMember
    {
        // Assert user belongs to the organization
        if (!$user->belongsToOrganization($project->organization_id)) {
            throw ValidationException::withMessages([
                'user_id' => ['User must be a member of the organization before being added to a project.'],
            ]);
        }

        $existing = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'user_id' => ['User is already a member of this project.'],
            ]);
        }

        $member = ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => $role,
        ]);

        ActivityLogger::log(
            $project->organization_id,
            $actor->id,
            'project.member_added',
            "Added {$user->name} to project {$project->name} as {$role}",
            $project,
            ['target_user_id' => $user->id, 'role' => $role]
        );

        return $member;
    }
}

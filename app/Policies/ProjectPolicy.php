<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        if (!$user->belongsToOrganization($project->organization_id)) {
            return false;
        }

        if ($project->visibility === 'organization' || $user->isOrganizationAdmin($project->organization_id)) {
            return true;
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Project $project): bool
    {
        if (!$user->belongsToOrganization($project->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($project->organization_id)) {
            return true;
        }

        $member = $project->members()->where('user_id', $user->id)->first();
        return $member && in_array($member->role, ['project_manager']);
    }

    public function delete(User $user, Project $project): bool
    {
        if (!$user->belongsToOrganization($project->organization_id)) {
            return false;
        }

        return $user->isOrganizationAdmin($project->organization_id);
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }
}

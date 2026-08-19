<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Release;
use App\Models\User;

class ReleasePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        if (!$user->belongsToOrganization($project->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($project->organization_id)) {
            return true;
        }

        if ($project->visibility === 'organization') {
            return true;
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, Release $release): bool
    {
        if (!$user->belongsToOrganization($release->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($release->organization_id)) {
            return true;
        }

        $project = $release->project;
        if ($project && $project->visibility === 'organization') {
            return true;
        }

        return $project && $project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Project $project): bool
    {
        if (!$user->belongsToOrganization($project->organization_id)) {
            return false;
        }

        $role = $user->getOrganizationRole($project->organization_id);
        return in_array($role, ['organization_admin', 'project_manager', 'developer']);
    }

    public function update(User $user, Release $release): bool
    {
        if (!$user->belongsToOrganization($release->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($release->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($release->organization_id);
        return in_array($role, ['project_manager']);
    }

    public function delete(User $user, Release $release): bool
    {
        return $this->update($user, $release);
    }

    public function restore(User $user, Release $release): bool
    {
        return $this->update($user, $release);
    }

    public function start(User $user, Release $release): bool
    {
        return $this->update($user, $release);
    }

    public function complete(User $user, Release $release): bool
    {
        return $this->update($user, $release);
    }

    public function cancel(User $user, Release $release): bool
    {
        return $this->update($user, $release);
    }

    public function manageIssues(User $user, Release $release): bool
    {
        if (!$user->belongsToOrganization($release->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($release->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($release->organization_id);
        return in_array($role, ['project_manager', 'developer']);
    }

    public function manageReleaseManager(User $user, Release $release): bool
    {
        return $this->update($user, $release);
    }
}

<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;

class SprintPolicy
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

    public function view(User $user, Sprint $sprint): bool
    {
        if (!$user->belongsToOrganization($sprint->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($sprint->organization_id)) {
            return true;
        }

        $project = $sprint->project;
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

    public function update(User $user, Sprint $sprint): bool
    {
        if (!$user->belongsToOrganization($sprint->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($sprint->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($sprint->organization_id);
        return in_array($role, ['project_manager']);
    }

    public function delete(User $user, Sprint $sprint): bool
    {
        return $this->update($user, $sprint);
    }

    public function restore(User $user, Sprint $sprint): bool
    {
        return $this->update($user, $sprint);
    }

    public function start(User $user, Sprint $sprint): bool
    {
        return $this->update($user, $sprint);
    }

    public function complete(User $user, Sprint $sprint): bool
    {
        return $this->update($user, $sprint);
    }

    public function cancel(User $user, Sprint $sprint): bool
    {
        return $this->update($user, $sprint);
    }

    public function manageIssues(User $user, Sprint $sprint): bool
    {
        if (!$user->belongsToOrganization($sprint->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($sprint->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($sprint->organization_id);
        return in_array($role, ['project_manager', 'developer']);
    }
}

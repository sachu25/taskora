<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\TestRun;
use App\Models\User;

class TestRunPolicy
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

    public function view(User $user, TestRun $run): bool
    {
        if (!$user->belongsToOrganization($run->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($run->organization_id)) {
            return true;
        }

        $project = $run->project;
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
        return in_array($role, ['organization_admin', 'project_manager', 'tester']);
    }

    public function update(User $user, TestRun $run): bool
    {
        if (!$user->belongsToOrganization($run->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($run->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($run->organization_id);
        return in_array($role, ['project_manager', 'tester']);
    }

    public function delete(User $user, TestRun $run): bool
    {
        if (!$user->belongsToOrganization($run->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($run->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($run->organization_id);
        return in_array($role, ['project_manager']);
    }

    public function restore(User $user, TestRun $run): bool
    {
        return $this->delete($user, $run);
    }

    public function start(User $user, TestRun $run): bool
    {
        return $this->update($user, $run);
    }

    public function complete(User $user, TestRun $run): bool
    {
        return $this->update($user, $run);
    }

    public function cancel(User $user, TestRun $run): bool
    {
        return $this->update($user, $run);
    }

    public function manageCases(User $user, TestRun $run): bool
    {
        return $this->update($user, $run);
    }
}

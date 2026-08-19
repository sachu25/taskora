<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\TestSuite;
use App\Models\User;

class TestSuitePolicy
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

    public function view(User $user, TestSuite $suite): bool
    {
        if (!$user->belongsToOrganization($suite->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($suite->organization_id)) {
            return true;
        }

        $project = $suite->project;
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
        return in_array($role, ['organization_admin', 'project_manager', 'developer', 'tester']);
    }

    public function update(User $user, TestSuite $suite): bool
    {
        if (!$user->belongsToOrganization($suite->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($suite->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($suite->organization_id);
        return in_array($role, ['project_manager', 'developer', 'tester']);
    }

    public function delete(User $user, TestSuite $suite): bool
    {
        if (!$user->belongsToOrganization($suite->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($suite->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($suite->organization_id);
        return in_array($role, ['project_manager']);
    }

    public function restore(User $user, TestSuite $suite): bool
    {
        return $this->delete($user, $suite);
    }
}

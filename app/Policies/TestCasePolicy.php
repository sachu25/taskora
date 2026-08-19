<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\TestCase;
use App\Models\User;

class TestCasePolicy
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

    public function view(User $user, TestCase $testCase): bool
    {
        if (!$user->belongsToOrganization($testCase->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($testCase->organization_id)) {
            return true;
        }

        $project = $testCase->project;
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

    public function update(User $user, TestCase $testCase): bool
    {
        if (!$user->belongsToOrganization($testCase->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($testCase->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($testCase->organization_id);
        return in_array($role, ['project_manager', 'developer', 'tester']);
    }

    public function delete(User $user, TestCase $testCase): bool
    {
        if (!$user->belongsToOrganization($testCase->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($testCase->organization_id)) {
            return true;
        }

        $role = $user->getOrganizationRole($testCase->organization_id);
        return in_array($role, ['project_manager']);
    }

    public function restore(User $user, TestCase $testCase): bool
    {
        return $this->delete($user, $testCase);
    }

    public function manageSteps(User $user, TestCase $testCase): bool
    {
        return $this->update($user, $testCase);
    }

    public function manageIssues(User $user, TestCase $testCase): bool
    {
        return $this->update($user, $testCase);
    }
}

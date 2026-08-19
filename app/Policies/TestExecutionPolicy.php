<?php

namespace App\Policies;

use App\Models\TestRun;
use App\Models\User;

class TestExecutionPolicy
{
    public function viewAny(User $user, TestRun $run): bool
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

    public function execute(User $user, TestRun $run): bool
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

    public function reset(User $user, TestRun $run): bool
    {
        return $this->execute($user, $run);
    }
}

<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;

class OrganizationPolicy
{
    public function view(User $user, Organization $organization): bool
    {
        return $user->belongsToOrganization($organization->id);
    }

    public function update(User $user, Organization $organization): bool
    {
        return $user->isOrganizationAdmin($organization->id);
    }

    public function manageMembers(User $user, Organization $organization): bool
    {
        return $user->isOrganizationAdmin($organization->id);
    }

    public function createTeam(User $user, Organization $organization): bool
    {
        if (!$user->belongsToOrganization($organization->id)) {
            return false;
        }
        $role = $user->getOrganizationRole($organization->id);
        return in_array($role, ['organization_admin', 'project_manager']);
    }

    public function createProject(User $user, Organization $organization): bool
    {
        if (!$user->belongsToOrganization($organization->id)) {
            return false;
        }
        $role = $user->getOrganizationRole($organization->id);
        return in_array($role, ['organization_admin', 'project_manager']);
    }
}

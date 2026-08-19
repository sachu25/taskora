<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        return $user->belongsToOrganization($team->organization_id);
    }

    public function update(User $user, Team $team): bool
    {
        if (!$user->belongsToOrganization($team->organization_id)) {
            return false;
        }
        $role = $user->getOrganizationRole($team->organization_id);
        return in_array($role, ['organization_admin', 'project_manager']) || $team->created_by === $user->id;
    }

    public function delete(User $user, Team $team): bool
    {
        if (!$user->belongsToOrganization($team->organization_id)) {
            return false;
        }
        return $user->isOrganizationAdmin($team->organization_id);
    }

    public function manageMembers(User $user, Team $team): bool
    {
        return $this->update($user, $team);
    }
}

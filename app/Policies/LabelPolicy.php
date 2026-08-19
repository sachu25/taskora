<?php

namespace App\Policies;

use App\Models\Label;
use App\Models\Organization;
use App\Models\User;

class LabelPolicy
{
    public function view(User $user, Organization $organization): bool
    {
        return $user->belongsToOrganization($organization->id);
    }

    public function manage(User $user, Organization $organization): bool
    {
        if (!$user->belongsToOrganization($organization->id)) {
            return false;
        }

        $role = $user->getOrganizationRole($organization->id);
        return in_array($role, ['organization_admin', 'project_manager', 'developer', 'tester']);
    }

    public function update(User $user, Label $label): bool
    {
        return $this->manage($user, $label->organization);
    }

    public function delete(User $user, Label $label): bool
    {
        return $this->manage($user, $label->organization);
    }
}

<?php

namespace App\Domain\Organization\Actions;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class RemoveOrganizationMember
{
    public function execute(User $actor, Organization $organization, User $targetUser): void
    {
        $member = OrganizationMember::where('organization_id', $organization->id)
            ->where('user_id', $targetUser->id)
            ->first();

        if (!$member) {
            throw ValidationException::withMessages([
                'user' => ['User is not a member of this organization.'],
            ]);
        }

        // Prevent removing the last organization admin
        if ($member->role === 'organization_admin') {
            $adminCount = OrganizationMember::where('organization_id', $organization->id)
                ->where('role', 'organization_admin')
                ->count();
            if ($adminCount <= 1) {
                throw ValidationException::withMessages([
                    'user' => ['Cannot remove the sole organization administrator.'],
                ]);
            }
        }

        $member->delete();

        ActivityLogger::log(
            $organization->id,
            $actor->id,
            'organization.member_removed',
            "Removed {$targetUser->name} from organization",
            $organization,
            ['target_user_id' => $targetUser->id]
        );
    }
}

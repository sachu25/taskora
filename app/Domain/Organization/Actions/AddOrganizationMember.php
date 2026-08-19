<?php

namespace App\Domain\Organization\Actions;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class AddOrganizationMember
{
    public function execute(User $actor, Organization $organization, string $email, string $role = 'developer'): OrganizationMember
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User with this email does not exist.'],
            ]);
        }

        $existing = OrganizationMember::where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'email' => ['User is already a member of this organization.'],
            ]);
        }

        $member = OrganizationMember::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'role' => $role,
            'status' => 'active',
            'joined_at' => now(),
        ]);

        ActivityLogger::log(
            $organization->id,
            $actor->id,
            'organization.member_added',
            "Added {$user->name} to organization as {$role}",
            $organization,
            ['target_user_id' => $user->id, 'role' => $role]
        );

        return $member;
    }
}

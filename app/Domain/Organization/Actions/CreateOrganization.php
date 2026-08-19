<?php

namespace App\Domain\Organization\Actions;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateOrganization
{
    public function execute(User $user, array $data): Organization
    {
        return DB::transaction(function () use ($user, $data) {
            $name = $data['name'];
            $slug = $data['slug'] ?? Str::slug($name);

            $organization = Organization::create([
                'name' => $name,
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'timezone' => $data['timezone'] ?? 'UTC',
                'status' => 'active',
            ]);

            OrganizationMember::create([
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'role' => 'organization_admin',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            ActivityLogger::log(
                $organization->id,
                $user->id,
                'organization.created',
                "Created organization {$organization->name}",
                $organization
            );

            return $organization;
        });
    }
}

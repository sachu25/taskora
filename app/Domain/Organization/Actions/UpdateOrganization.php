<?php

namespace App\Domain\Organization\Actions;

use App\Models\Organization;
use App\Models\User;
use App\Services\ActivityLogger;

class UpdateOrganization
{
    public function execute(User $user, Organization $organization, array $data): Organization
    {
        $organization->update(array_filter([
            'name' => $data['name'] ?? null,
            'slug' => $data['slug'] ?? null,
            'logo' => $data['logo'] ?? null,
            'description' => $data['description'] ?? null,
            'timezone' => $data['timezone'] ?? null,
            'status' => $data['status'] ?? null,
        ], fn ($val) => !is_null($val)));

        ActivityLogger::log(
            $organization->id,
            $user->id,
            'organization.updated',
            "Updated organization settings for {$organization->name}",
            $organization
        );

        return $organization;
    }
}

<?php

namespace App\Domain\Issue\Actions;

use App\Models\Label;
use App\Models\Organization;
use App\Models\User;

class AddOrganizationLabel
{
    public function execute(User $creator, Organization $organization, string $name, string $color = '#6366f1'): Label
    {
        return Label::create([
            'organization_id' => $organization->id,
            'name' => $name,
            'color' => $color,
            'created_by' => $creator->id,
        ]);
    }
}

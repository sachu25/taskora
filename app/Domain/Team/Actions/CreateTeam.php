<?php

namespace App\Domain\Team\Actions;

use App\Models\Organization;
use App\Models\Team;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Str;

class CreateTeam
{
    public function execute(User $creator, Organization $organization, array $data): Team
    {
        $name = $data['name'];
        $slug = $data['slug'] ?? Str::slug($name);

        $team = Team::create([
            'organization_id' => $organization->id,
            'name' => $name,
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'created_by' => $creator->id,
        ]);

        ActivityLogger::log(
            $organization->id,
            $creator->id,
            'team.created',
            "Created team {$team->name}",
            $team
        );

        return $team;
    }
}

<?php

namespace App\Domain\Team\Actions;

use App\Models\Team;
use App\Models\User;
use App\Services\ActivityLogger;

class UpdateTeam
{
    public function execute(User $actor, Team $team, array $data): Team
    {
        $team->update(array_filter([
            'name' => $data['name'] ?? null,
            'slug' => $data['slug'] ?? null,
            'description' => $data['description'] ?? null,
        ], fn ($val) => !is_null($val)));

        ActivityLogger::log(
            $team->organization_id,
            $actor->id,
            'team.updated',
            "Updated team {$team->name}",
            $team
        );

        return $team;
    }
}

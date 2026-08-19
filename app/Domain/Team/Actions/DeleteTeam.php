<?php

namespace App\Domain\Team\Actions;

use App\Models\Team;
use App\Models\User;
use App\Services\ActivityLogger;

class DeleteTeam
{
    public function execute(User $actor, Team $team): void
    {
        $orgId = $team->organization_id;
        $name = $team->name;

        $team->delete();

        ActivityLogger::log(
            $orgId,
            $actor->id,
            'team.deleted',
            "Deleted team {$name}"
        );
    }
}

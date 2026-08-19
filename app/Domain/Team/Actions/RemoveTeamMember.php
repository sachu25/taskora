<?php

namespace App\Domain\Team\Actions;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class RemoveTeamMember
{
    public function execute(User $actor, Team $team, User $user): void
    {
        $member = TeamMember::where('team_id', $team->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$member) {
            throw ValidationException::withMessages([
                'user_id' => ['User is not a member of this team.'],
            ]);
        }

        $member->delete();

        ActivityLogger::log(
            $team->organization_id,
            $actor->id,
            'team.member_removed',
            "Removed {$user->name} from team {$team->name}",
            $team,
            ['target_user_id' => $user->id]
        );
    }
}

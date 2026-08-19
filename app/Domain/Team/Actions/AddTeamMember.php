<?php

namespace App\Domain\Team\Actions;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class AddTeamMember
{
    public function execute(User $actor, Team $team, User $user): TeamMember
    {
        // Assert user belongs to the same organization
        if (!$user->belongsToOrganization($team->organization_id)) {
            throw ValidationException::withMessages([
                'user_id' => ['User must be a member of the organization before being added to a team.'],
            ]);
        }

        $existing = TeamMember::where('team_id', $team->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'user_id' => ['User is already a member of this team.'],
            ]);
        }

        $member = TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);

        ActivityLogger::log(
            $team->organization_id,
            $actor->id,
            'team.member_added',
            "Added {$user->name} to team {$team->name}",
            $team,
            ['target_user_id' => $user->id]
        );

        return $member;
    }
}

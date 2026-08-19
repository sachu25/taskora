<?php

namespace App\Domain\Project\Actions;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class RemoveProjectMember
{
    public function execute(User $actor, Project $project, User $user): void
    {
        $member = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$member) {
            throw ValidationException::withMessages([
                'user_id' => ['User is not a member of this project.'],
            ]);
        }

        $member->delete();

        ActivityLogger::log(
            $project->organization_id,
            $actor->id,
            'project.member_removed',
            "Removed {$user->name} from project {$project->name}",
            $project,
            ['target_user_id' => $user->id]
        );
    }
}

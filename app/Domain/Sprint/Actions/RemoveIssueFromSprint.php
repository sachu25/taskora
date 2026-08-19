<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Issue;
use App\Models\Sprint;
use App\Models\SprintIssue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RemoveIssueFromSprint
{
    public function execute(User $user, Sprint $sprint, Issue $issue): bool
    {
        return DB::transaction(function () use ($user, $sprint, $issue) {
            $sprintIssue = SprintIssue::where('sprint_id', $sprint->id)
                ->where('issue_id', $issue->id)
                ->first();

            if (!$sprintIssue) {
                throw ValidationException::withMessages([
                    'issue' => ['Issue is not part of this sprint.'],
                ]);
            }

            $deleted = $sprintIssue->delete();

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.issue_removed',
                "Removed issue {$issue->key} from sprint '{$sprint->name}'",
                $sprint
            );

            return (bool) $deleted;
        });
    }
}

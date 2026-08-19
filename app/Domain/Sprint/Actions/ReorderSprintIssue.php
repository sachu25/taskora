<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Issue;
use App\Models\Sprint;
use App\Models\SprintIssue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReorderSprintIssue
{
    public function execute(User $user, Sprint $sprint, Issue $issue, int $newPosition): SprintIssue
    {
        return DB::transaction(function () use ($user, $sprint, $issue, $newPosition) {
            $sprintIssue = SprintIssue::where('sprint_id', $sprint->id)
                ->where('issue_id', $issue->id)
                ->first();

            if (!$sprintIssue) {
                throw ValidationException::withMessages([
                    'issue' => ['Issue is not part of this sprint.'],
                ]);
            }

            $sprintIssue->update(['position' => max(0, $newPosition)]);

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.issue_reordered',
                "Reordered issue {$issue->key} in sprint '{$sprint->name}' to position {$newPosition}",
                $sprint
            );

            return $sprintIssue;
        });
    }
}

<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Issue;
use App\Models\Sprint;
use App\Models\SprintIssue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddIssueToSprint
{
    public function execute(User $user, Sprint $sprint, Issue $issue, ?int $position = null): SprintIssue
    {
        if (in_array($sprint->status, ['completed', 'cancelled'])) {
            throw ValidationException::withMessages([
                'sprint' => ["Cannot add issues to a {$sprint->status} sprint."],
            ]);
        }

        if ($issue->organization_id !== $sprint->organization_id) {
            throw ValidationException::withMessages([
                'issue' => ['Issue belongs to a different organization.'],
            ]);
        }

        if ($issue->project_id !== $sprint->project_id) {
            throw ValidationException::withMessages([
                'issue' => ['Issue must belong to the same project as the sprint.'],
            ]);
        }

        return DB::transaction(function () use ($user, $sprint, $issue, $position) {
            $exists = SprintIssue::where('sprint_id', $sprint->id)
                ->where('issue_id', $issue->id)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'issue' => ['Issue is already added to this sprint.'],
                ]);
            }

            $maxPosition = SprintIssue::where('sprint_id', $sprint->id)->max('position') ?? 0;
            $finalPosition = $position ?? ($maxPosition + 1);

            $sprintIssue = SprintIssue::create([
                'sprint_id' => $sprint->id,
                'issue_id' => $issue->id,
                'added_by' => $user->id,
                'position' => $finalPosition,
                'added_at' => now(),
            ]);

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.issue_added',
                "Added issue {$issue->key} to sprint '{$sprint->name}'",
                $sprint
            );

            return $sprintIssue;
        });
    }
}

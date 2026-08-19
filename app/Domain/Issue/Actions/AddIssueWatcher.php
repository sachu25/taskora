<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class AddIssueWatcher
{
    public function execute(User $actor, Issue $issue, ?User $targetUser = null): void
    {
        $userToWatch = $targetUser ?: $actor;

        if (!$userToWatch->belongsToOrganization($issue->organization_id)) {
            throw ValidationException::withMessages([
                'user_id' => ['User must belong to the same organization.'],
            ]);
        }

        if ($issue->watchers()->where('user_id', $userToWatch->id)->exists()) {
            return;
        }

        $issue->watchers()->attach($userToWatch->id, ['created_at' => now()]);

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.watcher_added',
            "{$userToWatch->name} started watching issue {$issue->key}",
            $issue,
            ['watcher_id' => $userToWatch->id]
        );
    }
}

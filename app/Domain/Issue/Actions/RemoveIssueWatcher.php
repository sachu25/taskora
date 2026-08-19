<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\User;
use App\Services\ActivityLogger;

class RemoveIssueWatcher
{
    public function execute(User $actor, Issue $issue, User $targetUser): void
    {
        $issue->watchers()->detach($targetUser->id);

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.watcher_removed',
            "{$targetUser->name} stopped watching issue {$issue->key}",
            $issue,
            ['watcher_id' => $targetUser->id]
        );
    }
}

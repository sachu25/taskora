<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\User;
use App\Services\ActivityLogger;

class RestoreIssue
{
    public function execute(User $actor, Issue $issue): Issue
    {
        $issue->restore();

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.restored',
            "Restored issue {$issue->key}",
            $issue
        );

        return $issue;
    }
}

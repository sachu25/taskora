<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\User;
use App\Services\ActivityLogger;

class DeleteIssue
{
    public function execute(User $actor, Issue $issue): void
    {
        $orgId = $issue->organization_id;
        $key = $issue->key;

        $issue->delete();

        ActivityLogger::log(
            $orgId,
            $actor->id,
            'issue.deleted',
            "Soft deleted issue {$key}"
        );
    }
}

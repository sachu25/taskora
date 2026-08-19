<?php

namespace App\Domain\Issue\Actions;

use App\Models\IssueLink;
use App\Models\User;
use App\Services\ActivityLogger;

class DeleteIssueLink
{
    public function execute(User $actor, IssueLink $link): void
    {
        $orgId = $link->organization_id;
        $issueId = $link->issue_id;

        $link->delete();

        ActivityLogger::log(
            $orgId,
            $actor->id,
            'issue.link_removed',
            "Removed link from issue",
            null,
            ['issue_id' => $issueId]
        );
    }
}

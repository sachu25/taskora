<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\IssueComment;
use App\Models\User;
use App\Services\ActivityLogger;

class AddIssueComment
{
    public function execute(User $actor, Issue $issue, string $body): IssueComment
    {
        $comment = IssueComment::create([
            'organization_id' => $issue->organization_id,
            'issue_id' => $issue->id,
            'user_id' => $actor->id,
            'body' => $body,
        ]);

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.comment_added',
            "Added a comment on issue {$issue->key}",
            $issue,
            ['comment_id' => $comment->id]
        );

        app(\App\Domain\Notification\Services\NotificationDispatcher::class)
            ->dispatchIssueCommented($issue, $body, $actor->id);

        return $comment;
    }
}

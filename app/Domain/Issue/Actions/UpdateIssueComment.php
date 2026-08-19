<?php

namespace App\Domain\Issue\Actions;

use App\Models\IssueComment;
use App\Models\User;

class UpdateIssueComment
{
    public function execute(User $actor, IssueComment $comment, string $body): IssueComment
    {
        $comment->update(['body' => $body]);
        return $comment;
    }
}

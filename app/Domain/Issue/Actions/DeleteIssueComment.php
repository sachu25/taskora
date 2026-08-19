<?php

namespace App\Domain\Issue\Actions;

use App\Models\IssueComment;
use App\Models\User;

class DeleteIssueComment
{
    public function execute(User $actor, IssueComment $comment): void
    {
        $comment->delete();
    }
}

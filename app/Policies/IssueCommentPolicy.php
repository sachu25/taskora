<?php

namespace App\Policies;

use App\Models\IssueComment;
use App\Models\User;

class IssueCommentPolicy
{
    public function update(User $user, IssueComment $comment): bool
    {
        if (!$user->belongsToOrganization($comment->organization_id)) {
            return false;
        }

        return $comment->user_id === $user->id || $user->isOrganizationAdmin($comment->organization_id);
    }

    public function delete(User $user, IssueComment $comment): bool
    {
        if (!$user->belongsToOrganization($comment->organization_id)) {
            return false;
        }

        $role = $user->getOrganizationRole($comment->organization_id);
        return $comment->user_id === $user->id || in_array($role, ['organization_admin', 'project_manager']);
    }
}

<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\IssueLink;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class CreateIssueLink
{
    public function execute(User $actor, Issue $issue, string $linkedIssueId, string $linkType): IssueLink
    {
        if ($issue->id === $linkedIssueId) {
            throw ValidationException::withMessages([
                'linked_issue_id' => ['An issue cannot be linked to itself.'],
            ]);
        }

        $linkedIssue = Issue::find($linkedIssueId);

        if (!$linkedIssue || $linkedIssue->organization_id !== $issue->organization_id) {
            throw ValidationException::withMessages([
                'linked_issue_id' => ['The linked issue must exist within the same organization.'],
            ]);
        }

        $allowedTypes = ['blocks', 'blocked_by', 'duplicates', 'duplicated_by', 'relates_to'];
        if (!in_array($linkType, $allowedTypes)) {
            throw ValidationException::withMessages([
                'link_type' => ['Invalid link type specified.'],
            ]);
        }

        $existing = IssueLink::where('issue_id', $issue->id)
            ->where('linked_issue_id', $linkedIssue->id)
            ->where('link_type', $linkType)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'linked_issue_id' => ['This link relationship already exists.'],
            ]);
        }

        $link = IssueLink::create([
            'organization_id' => $issue->organization_id,
            'issue_id' => $issue->id,
            'linked_issue_id' => $linkedIssue->id,
            'link_type' => $linkType,
            'created_by' => $actor->id,
            'created_at' => now(),
        ]);

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.link_added',
            "Linked issue {$issue->key} ({$linkType}) to {$linkedIssue->key}",
            $issue,
            ['linked_issue_id' => $linkedIssue->id, 'link_type' => $linkType]
        );

        return $link;
    }
}

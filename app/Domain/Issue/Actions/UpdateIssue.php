<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class UpdateIssue
{
    public function execute(User $actor, Issue $issue, array $data): Issue
    {
        // 1. Validate Assignee if changing
        if (array_key_exists('assignee_id', $data) && !empty($data['assignee_id'])) {
            $assignee = User::find($data['assignee_id']);
            if (!$assignee || !$assignee->belongsToOrganization($issue->organization_id)) {
                throw ValidationException::withMessages([
                    'assignee_id' => ['The selected assignee must belong to the organization.'],
                ]);
            }
        }

        // 2. Validate Parent Issue if changing
        if (array_key_exists('parent_id', $data) && !empty($data['parent_id'])) {
            if ($data['parent_id'] === $issue->id) {
                throw ValidationException::withMessages([
                    'parent_id' => ['An issue cannot be its own parent.'],
                ]);
            }
            $parent = Issue::where('project_id', $issue->project_id)
                ->where('id', $data['parent_id'])
                ->first();
            if (!$parent) {
                throw ValidationException::withMessages([
                    'parent_id' => ['The parent issue must exist within the same project.'],
                ]);
            }
        }

        $oldStatus = $issue->status;
        $oldPriority = $issue->priority;
        $oldAssigneeId = $issue->assignee_id;

        $issue->update(array_filter([
            'title' => $data['title'] ?? null,
            'description' => array_key_exists('description', $data) ? $data['description'] : null,
            'issue_type' => $data['issue_type'] ?? null,
            'status' => $data['status'] ?? null,
            'priority' => $data['priority'] ?? null,
            'severity' => array_key_exists('severity', $data) ? $data['severity'] : null,
            'assignee_id' => array_key_exists('assignee_id', $data) ? $data['assignee_id'] : null,
            'parent_id' => array_key_exists('parent_id', $data) ? $data['parent_id'] : null,
        ], fn ($val, $key) => !is_null($val) || in_array($key, ['description', 'severity', 'assignee_id', 'parent_id']), ARRAY_FILTER_USE_BOTH));

        // Activity Logging
        if (isset($data['status']) && $data['status'] !== $oldStatus) {
            ActivityLogger::log(
                $issue->organization_id,
                $actor->id,
                'issue.status_changed',
                "Changed status of {$issue->key} from {$oldStatus} to {$issue->status}",
                $issue,
                ['old_status' => $oldStatus, 'new_status' => $issue->status]
            );

            app(\App\Domain\Notification\Services\NotificationDispatcher::class)
                ->dispatchIssueStatusChanged($issue, $oldStatus, $issue->status, $actor->id);
        }

        if (isset($data['priority']) && $data['priority'] !== $oldPriority) {
            ActivityLogger::log(
                $issue->organization_id,
                $actor->id,
                'issue.priority_changed',
                "Changed priority of {$issue->key} from {$oldPriority} to {$issue->priority}",
                $issue,
                ['old_priority' => $oldPriority, 'new_priority' => $issue->priority]
            );
        }

        if (array_key_exists('assignee_id', $data) && $data['assignee_id'] !== $oldAssigneeId) {
            $assigneeName = $issue->assignee ? $issue->assignee->name : 'Unassigned';
            ActivityLogger::log(
                $issue->organization_id,
                $actor->id,
                'issue.assigned',
                "Assigned {$issue->key} to {$assigneeName}",
                $issue,
                ['assignee_id' => $issue->assignee_id]
            );

            app(\App\Domain\Notification\Services\NotificationDispatcher::class)
                ->dispatchIssueAssigned($issue, $actor->id);
        }

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.updated',
            "Updated issue {$issue->key}",
            $issue
        );

        return $issue;
    }
}

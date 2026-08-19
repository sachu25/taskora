<?php

namespace App\Domain\Notification\Services;

use App\Domain\Notification\Actions\CreateNotification;
use App\Models\Issue;
use App\Models\Release;
use App\Models\Sprint;
use App\Models\TestRun;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationDispatcher
{
    protected CreateNotification $createNotification;

    public function __construct(CreateNotification $createNotification)
    {
        $this->createNotification = $createNotification;
    }

    /**
     * Dispatch notification for issue assigned/reassigned
     */
    public function dispatchIssueAssigned(Issue $issue, ?string $actorId): void
    {
        if (! $issue->assignee_id || $issue->assignee_id === $actorId) {
            return;
        }

        try {
            $this->createNotification->execute(
                organizationId: $issue->organization_id,
                userId: $issue->assignee_id,
                type: \App\Domain\Notification\NotificationType::ISSUE_ASSIGNED,
                title: "Issue Assigned: {$issue->key}",
                message: "You have been assigned to issue '{$issue->title}' ({$issue->key}).",
                projectId: $issue->project_id,
                entityType: 'Issue',
                entityId: $issue->id,
                actionUrl: "/projects/{$issue->project_id}/issues/{$issue->id}",
                metadata: ['issue_key' => $issue->key, 'issue_title' => $issue->title]
            );
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch issue assigned notification: '.$e->getMessage());
        }
    }

    /**
     * Dispatch notification for issue status changed
     */
    public function dispatchIssueStatusChanged(Issue $issue, string $oldStatus, string $newStatus, ?string $actorId): void
    {
        $recipients = collect([$issue->assignee_id, $issue->reporter_id])
            ->merge($issue->watchers()->pluck('users.id'))
            ->filter()
            ->reject(fn ($id) => $id === $actorId)
            ->unique();

        foreach ($recipients as $recipientId) {
            try {
                $this->createNotification->execute(
                    organizationId: $issue->organization_id,
                    userId: $recipientId,
                    type: \App\Domain\Notification\NotificationType::ISSUE_STATUS_CHANGED,
                    title: "Issue Status Updated: {$issue->key}",
                    message: "Issue '{$issue->title}' ({$issue->key}) status changed from '{$oldStatus}' to '{$newStatus}'.",
                    projectId: $issue->project_id,
                    entityType: 'Issue',
                    entityId: $issue->id,
                    actionUrl: "/projects/{$issue->project_id}/issues/{$issue->id}",
                    metadata: ['issue_key' => $issue->key, 'old_status' => $oldStatus, 'new_status' => $newStatus]
                );
            } catch (\Throwable $e) {
                Log::error('Failed to dispatch status change notification: '.$e->getMessage());
            }
        }
    }

    /**
     * Dispatch notification for new issue comment
     */
    public function dispatchIssueCommented(Issue $issue, string $commentBody, ?string $actorId): void
    {
        $recipients = collect([$issue->assignee_id, $issue->reporter_id])
            ->merge($issue->watchers()->pluck('users.id'))
            ->filter()
            ->reject(fn ($id) => $id === $actorId)
            ->unique();

        foreach ($recipients as $recipientId) {
            try {
                $this->createNotification->execute(
                    organizationId: $issue->organization_id,
                    userId: $recipientId,
                    type: \App\Domain\Notification\NotificationType::ISSUE_COMMENTED,
                    title: "New Comment on {$issue->key}",
                    message: "New comment on '{$issue->title}': ".mb_substr($commentBody, 0, 100).'...',
                    projectId: $issue->project_id,
                    entityType: 'Issue',
                    entityId: $issue->id,
                    actionUrl: "/projects/{$issue->project_id}/issues/{$issue->id}",
                    metadata: ['issue_key' => $issue->key]
                );
            } catch (\Throwable $e) {
                Log::error('Failed to dispatch comment notification: '.$e->getMessage());
            }
        }
    }

    /**
     * Dispatch notification for sprint lifecycle (started, completed, cancelled)
     */
    public function dispatchSprintLifecycle(Sprint $sprint, string $type, ?string $actorId): void
    {
        // Notify project members
        $projectMembers = $sprint->project->users()->pluck('users.id')
            ->reject(fn ($id) => $id === $actorId)
            ->unique();

        $actionText = match ($type) {
            \App\Domain\Notification\NotificationType::SPRINT_STARTED => 'started',
            \App\Domain\Notification\NotificationType::SPRINT_COMPLETED => 'completed',
            \App\Domain\Notification\NotificationType::SPRINT_CANCELLED => 'cancelled',
            default => 'updated',
        };

        foreach ($projectMembers as $recipientId) {
            try {
                $this->createNotification->execute(
                    organizationId: $sprint->organization_id,
                    userId: $recipientId,
                    type: $type,
                    title: "Sprint {$sprint->name} {$actionText}",
                    message: "Sprint '{$sprint->name}' in project '{$sprint->project->name}' has been {$actionText}.",
                    projectId: $sprint->project_id,
                    entityType: 'Sprint',
                    entityId: $sprint->id,
                    actionUrl: "/projects/{$sprint->project_id}/sprints/{$sprint->id}",
                    metadata: ['sprint_name' => $sprint->name]
                );
            } catch (\Throwable $e) {
                Log::error('Failed to dispatch sprint lifecycle notification: '.$e->getMessage());
            }
        }
    }

    /**
     * Dispatch notification for release lifecycle (started, completed, cancelled)
     */
    public function dispatchReleaseLifecycle(Release $release, string $type, ?string $actorId): void
    {
        $recipients = collect([$release->release_manager_id])
            ->merge($release->project->users()->pluck('users.id'))
            ->filter()
            ->reject(fn ($id) => $id === $actorId)
            ->unique();

        $actionText = match ($type) {
            \App\Domain\Notification\NotificationType::RELEASE_STARTED => 'started',
            \App\Domain\Notification\NotificationType::RELEASE_COMPLETED => 'completed',
            \App\Domain\Notification\NotificationType::RELEASE_CANCELLED => 'cancelled',
            default => 'updated',
        };

        foreach ($recipients as $recipientId) {
            try {
                $this->createNotification->execute(
                    organizationId: $release->organization_id,
                    userId: $recipientId,
                    type: $type,
                    title: "Release {$release->version} {$actionText}",
                    message: "Release '{$release->name}' ({$release->version}) in project '{$release->project->name}' has been {$actionText}.",
                    projectId: $release->project_id,
                    entityType: 'Release',
                    entityId: $release->id,
                    actionUrl: "/projects/{$release->project_id}/releases/{$release->id}",
                    metadata: ['release_version' => $release->version, 'release_name' => $release->name]
                );
            } catch (\Throwable $e) {
                Log::error('Failed to dispatch release lifecycle notification: '.$e->getMessage());
            }
        }
    }
}

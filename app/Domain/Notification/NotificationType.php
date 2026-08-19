<?php

namespace App\Domain\Notification;

class NotificationType
{
    public const ISSUE_ASSIGNED = 'issue.assigned';
    public const ISSUE_COMMENTED = 'issue.commented';
    public const ISSUE_STATUS_CHANGED = 'issue.status_changed';
    public const ISSUE_MENTIONED = 'issue.mentioned';
    public const ISSUE_WATCHED = 'issue.watched';

    public const SPRINT_STARTED = 'sprint.started';
    public const SPRINT_COMPLETED = 'sprint.completed';
    public const SPRINT_CANCELLED = 'sprint.cancelled';

    public const RELEASE_STARTED = 'release.started';
    public const RELEASE_COMPLETED = 'release.completed';
    public const RELEASE_CANCELLED = 'release.cancelled';

    public const QA_EXECUTION_FAILED = 'qa.execution_failed';
    public const QA_EXECUTION_COMPLETED = 'qa.execution_completed';

    public static function getPreferenceKey(string $type): string
    {
        return match ($type) {
            self::ISSUE_ASSIGNED => 'issue_assigned',
            self::ISSUE_COMMENTED => 'issue_commented',
            self::ISSUE_STATUS_CHANGED => 'issue_status_changed',
            self::ISSUE_MENTIONED => 'issue_mentioned',
            self::ISSUE_WATCHED => 'issue_watched',
            self::SPRINT_STARTED => 'sprint_started',
            self::SPRINT_COMPLETED => 'sprint_completed',
            self::SPRINT_CANCELLED => 'sprint_cancelled',
            self::RELEASE_STARTED => 'release_started',
            self::RELEASE_COMPLETED => 'release_completed',
            self::RELEASE_CANCELLED => 'release_cancelled',
            self::QA_EXECUTION_FAILED => 'qa_execution_failed',
            self::QA_EXECUTION_COMPLETED => 'qa_execution_completed',
            default => 'project_activity',
        };
    }

    public static function getAllTypes(): array
    {
        return [
            self::ISSUE_ASSIGNED,
            self::ISSUE_COMMENTED,
            self::ISSUE_STATUS_CHANGED,
            self::ISSUE_MENTIONED,
            self::ISSUE_WATCHED,
            self::SPRINT_STARTED,
            self::SPRINT_COMPLETED,
            self::SPRINT_CANCELLED,
            self::RELEASE_STARTED,
            self::RELEASE_COMPLETED,
            self::RELEASE_CANCELLED,
            self::QA_EXECUTION_FAILED,
            self::QA_EXECUTION_COMPLETED,
        ];
    }
}

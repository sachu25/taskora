<?php

namespace App\Domain\Notification\Actions;

use App\Domain\Notification\NotificationType;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;

class CreateNotification
{
    public function execute(
        string $organizationId,
        string $userId,
        string $type,
        string $title,
        string $message,
        ?string $projectId = null,
        ?string $entityType = null,
        ?string $entityId = null,
        ?string $actionUrl = null,
        array $metadata = []
    ): ?Notification {
        // Check user notification preference for this type
        $prefKey = NotificationType::getPreferenceKey($type);
        $pref = NotificationPreference::where('user_id', $userId)
            ->where('preference_key', $prefKey)
            ->first();

        if ($pref && ! $pref->enabled) {
            return null; // User disabled notifications for this category
        }

        // Verify recipient belongs to organization
        $recipient = User::find($userId);
        if (! $recipient || ! $recipient->belongsToOrganization($organizationId)) {
            return null;
        }

        return Notification::create([
            'organization_id' => $organizationId,
            'user_id' => $userId,
            'project_id' => $projectId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action_url' => $actionUrl,
            'metadata' => $metadata,
        ]);
    }
}

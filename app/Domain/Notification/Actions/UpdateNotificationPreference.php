<?php

namespace App\Domain\Notification\Actions;

use App\Models\NotificationPreference;

class UpdateNotificationPreference
{
    public function execute(string $organizationId, string $userId, string $preferenceKey, bool $enabled): NotificationPreference
    {
        return NotificationPreference::updateOrCreate(
            [
                'user_id' => $userId,
                'preference_key' => $preferenceKey,
            ],
            [
                'organization_id' => $organizationId,
                'enabled' => $enabled,
            ]
        );
    }
}

<?php

namespace App\Domain\Notification\Actions;

use App\Models\NotificationPreference;

class ResetNotificationPreferences
{
    public function execute(string $userId): int
    {
        return NotificationPreference::where('user_id', $userId)->delete();
    }
}

<?php

namespace App\Domain\Notification\Actions;

use App\Models\Notification;

class MarkAllNotificationsAsRead
{
    public function execute(string $organizationId, string $userId): int
    {
        return Notification::where('organization_id', $organizationId)
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}

<?php

namespace App\Domain\Notification\Actions;

use App\Models\Notification;

class DeleteAllReadNotifications
{
    public function execute(string $organizationId, string $userId): int
    {
        return Notification::where('organization_id', $organizationId)
            ->where('user_id', $userId)
            ->whereNotNull('read_at')
            ->delete();
    }
}

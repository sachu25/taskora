<?php

namespace App\Domain\Notification\Actions;

use App\Models\Notification;

class MarkNotificationAsRead
{
    public function execute(Notification $notification): Notification
    {
        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return $notification;
    }
}

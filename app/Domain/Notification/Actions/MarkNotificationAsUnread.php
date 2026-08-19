<?php

namespace App\Domain\Notification\Actions;

use App\Models\Notification;

class MarkNotificationAsUnread
{
    public function execute(Notification $notification): Notification
    {
        if ($notification->read_at) {
            $notification->update(['read_at' => null]);
        }

        return $notification;
    }
}

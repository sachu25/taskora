<?php

namespace App\Domain\Notification\Actions;

use App\Models\Notification;

class DeleteNotification
{
    public function execute(Notification $notification): bool
    {
        return (bool) $notification->delete();
    }
}

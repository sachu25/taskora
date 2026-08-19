<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StartRelease
{
    public function execute(User $actor, Release $release): Release
    {
        if ($release->status !== 'planned') {
            throw ValidationException::withMessages([
                'status' => ["Cannot start release because its status is '{$release->status}'. Only planned releases can be started."],
            ]);
        }

        return DB::transaction(function () use ($actor, $release) {
            $release->update([
                'status' => 'in_progress',
                'start_date' => $release->start_date ?? now()->toDateString(),
            ]);

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.started',
                "Started release '{$release->name}' ({$release->version})",
                $release
            );

            app(\App\Domain\Notification\Services\NotificationDispatcher::class)
                ->dispatchReleaseLifecycle($release, \App\Domain\Notification\NotificationType::RELEASE_STARTED, $actor->id);

            return $release;
        });
    }
}

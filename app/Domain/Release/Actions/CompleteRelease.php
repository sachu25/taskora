<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteRelease
{
    public function execute(User $actor, Release $release): Release
    {
        if ($release->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'status' => ["Cannot complete release because its status is '{$release->status}'. Only in_progress releases can be completed."],
            ]);
        }

        return DB::transaction(function () use ($actor, $release) {
            $release->update([
                'status' => 'released',
                'released_at' => now(),
                'release_date' => $release->release_date ?? now()->toDateString(),
            ]);

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.completed',
                "Completed release '{$release->name}' ({$release->version})",
                $release
            );

            return $release;
        });
    }
}

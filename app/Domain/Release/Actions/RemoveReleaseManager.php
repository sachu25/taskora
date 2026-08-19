<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class RemoveReleaseManager
{
    public function execute(User $actor, Release $release): Release
    {
        return DB::transaction(function () use ($actor, $release) {
            $release->update([
                'release_manager_id' => null,
            ]);

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.manager_removed',
                "Removed release manager from '{$release->name}' ({$release->version})",
                $release
            );

            return $release;
        });
    }
}

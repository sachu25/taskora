<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssignReleaseManager
{
    public function execute(User $actor, Release $release, User $manager): Release
    {
        if (!$manager->belongsToOrganization($release->organization_id)) {
            throw ValidationException::withMessages([
                'user_id' => ['The specified user does not belong to the release organization.'],
            ]);
        }

        return DB::transaction(function () use ($actor, $release, $manager) {
            $release->update([
                'release_manager_id' => $manager->id,
            ]);

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.manager_assigned',
                "Assigned {$manager->name} as release manager for '{$release->name}' ({$release->version})",
                $release
            );

            return $release;
        });
    }
}

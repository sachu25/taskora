<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RestoreRelease
{
    public function execute(User $actor, Release $release): Release
    {
        // Verify no active release with the same version exists
        $versionExists = Release::where('project_id', $release->project_id)
            ->where('version', $release->version)
            ->where('id', '!=', $release->id)
            ->whereNull('deleted_at')
            ->exists();

        if ($versionExists) {
            throw ValidationException::withMessages([
                'version' => ["Cannot restore release because version '{$release->version}' already exists in an active release."],
            ]);
        }

        return DB::transaction(function () use ($actor, $release) {
            $release->restore();

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.restored',
                "Restored release '{$release->name}' ({$release->version})",
                $release
            );

            return $release;
        });
    }
}

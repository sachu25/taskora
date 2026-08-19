<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateRelease
{
    public function execute(User $updater, Release $release, array $data): Release
    {
        $startDate = $data['start_date'] ?? $release->start_date?->format('Y-m-d');
        $releaseDate = $data['release_date'] ?? $release->release_date?->format('Y-m-d');

        if ($startDate && $releaseDate && $releaseDate < $startDate) {
            throw ValidationException::withMessages([
                'release_date' => ['The release date cannot be earlier than the start date.'],
            ]);
        }

        // Check version uniqueness if version is being updated
        if (isset($data['version']) && $data['version'] !== $release->version) {
            $versionExists = Release::where('project_id', $release->project_id)
                ->where('version', $data['version'])
                ->where('id', '!=', $release->id)
                ->exists();

            if ($versionExists) {
                throw ValidationException::withMessages([
                    'version' => ['A release with this version already exists for this project.'],
                ]);
            }
        }

        // Validate release manager if provided
        if (array_key_exists('release_manager_id', $data) && !empty($data['release_manager_id'])) {
            $manager = User::find($data['release_manager_id']);
            if (!$manager || !$manager->belongsToOrganization($release->organization_id)) {
                throw ValidationException::withMessages([
                    'release_manager_id' => ['The selected release manager must belong to the release organization.'],
                ]);
            }
        }

        return DB::transaction(function () use ($updater, $release, $data) {
            // Strip out lifecycle status parameter if accidentally passed to general update
            unset($data['status'], $data['released_at']);

            $release->update($data);

            ActivityLogger::log(
                $release->organization_id,
                $updater->id,
                'release.updated',
                "Updated release '{$release->name}' ({$release->version})",
                $release
            );

            return $release;
        });
    }
}

<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class DeleteRelease
{
    public function execute(User $actor, Release $release): void
    {
        DB::transaction(function () use ($actor, $release) {
            $release->delete();

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.deleted',
                "Soft-deleted release '{$release->name}' ({$release->version})",
                $release
            );
        });
    }
}

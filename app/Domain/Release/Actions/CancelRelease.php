<?php

namespace App\Domain\Release\Actions;

use App\Models\Release;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CancelRelease
{
    public function execute(User $actor, Release $release): Release
    {
        if (!in_array($release->status, ['planned', 'in_progress'])) {
            throw ValidationException::withMessages([
                'status' => ["Cannot cancel release because its status is '{$release->status}'."],
            ]);
        }

        return DB::transaction(function () use ($actor, $release) {
            $release->update([
                'status' => 'cancelled',
            ]);

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.cancelled',
                "Cancelled release '{$release->name}' ({$release->version})",
                $release
            );

            return $release;
        });
    }
}

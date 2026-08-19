<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class DeleteSprint
{
    public function execute(User $user, Sprint $sprint): bool
    {
        return DB::transaction(function () use ($user, $sprint) {
            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.deleted',
                "Soft-deleted sprint '{$sprint->name}'",
                $sprint
            );

            return $sprint->delete();
        });
    }
}

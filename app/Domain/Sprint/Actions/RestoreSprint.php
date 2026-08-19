<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class RestoreSprint
{
    public function execute(User $user, Sprint $sprint): Sprint
    {
        return DB::transaction(function () use ($user, $sprint) {
            $sprint->restore();

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.restored',
                "Restored sprint '{$sprint->name}'",
                $sprint
            );

            return $sprint;
        });
    }
}

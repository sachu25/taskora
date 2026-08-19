<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CancelSprint
{
    public function execute(User $user, Sprint $sprint): Sprint
    {
        if (in_array($sprint->status, ['completed', 'cancelled'])) {
            throw ValidationException::withMessages([
                'status' => ["Cannot cancel a sprint that is already '{$sprint->status}'."],
            ]);
        }

        return DB::transaction(function () use ($user, $sprint) {
            $sprint->update([
                'status' => 'cancelled',
            ]);

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.cancelled',
                "Cancelled sprint '{$sprint->name}'",
                $sprint
            );

            return $sprint;
        });
    }
}

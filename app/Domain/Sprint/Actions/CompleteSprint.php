<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteSprint
{
    public function execute(User $user, Sprint $sprint): Sprint
    {
        if ($sprint->status !== 'active') {
            throw ValidationException::withMessages([
                'status' => ["Cannot complete a sprint with status '{$sprint->status}'. Only active sprints can be completed."],
            ]);
        }

        return DB::transaction(function () use ($user, $sprint) {
            $sprint->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.completed',
                "Completed sprint '{$sprint->name}'",
                $sprint
            );

            return $sprint;
        });
    }
}

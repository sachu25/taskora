<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StartSprint
{
    public function execute(User $user, Sprint $sprint, array $dates = []): Sprint
    {
        if ($sprint->status !== 'planned') {
            throw ValidationException::withMessages([
                'status' => ["Cannot start a sprint with status '{$sprint->status}'. Only planned sprints can be started."],
            ]);
        }

        $startDate = $dates['start_date'] ?? $sprint->start_date?->format('Y-m-d') ?? now()->format('Y-m-d');
        $endDate = $dates['end_date'] ?? $sprint->end_date?->format('Y-m-d');

        if (!$endDate) {
            throw ValidationException::withMessages([
                'end_date' => ['Sprint end date is required to start a sprint.'],
            ]);
        }

        if ($endDate < $startDate) {
            throw ValidationException::withMessages([
                'end_date' => ['Sprint end date cannot be earlier than start date.'],
            ]);
        }

        return DB::transaction(function () use ($user, $sprint, $startDate, $endDate) {
            // Lock project row to safely check active sprint count under concurrent requests
            Project::where('id', $sprint->project_id)->lockForUpdate()->first();

            $existingActive = Sprint::where('project_id', $sprint->project_id)
                ->where('status', 'active')
                ->where('id', '!=', $sprint->id)
                ->exists();

            if ($existingActive) {
                throw ValidationException::withMessages([
                    'sprint' => ['Project already has an active sprint. Complete or cancel the active sprint first.'],
                ]);
            }

            $sprint->update([
                'status' => 'active',
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]);

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.started',
                "Started sprint '{$sprint->name}'",
                $sprint
            );

            app(\App\Domain\Notification\Services\NotificationDispatcher::class)
                ->dispatchSprintLifecycle($sprint, \App\Domain\Notification\NotificationType::SPRINT_STARTED, $user->id);

            return $sprint;
        });
    }
}

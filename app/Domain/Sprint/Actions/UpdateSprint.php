<?php

namespace App\Domain\Sprint\Actions;

use App\Models\Sprint;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateSprint
{
    public function execute(User $user, Sprint $sprint, array $data): Sprint
    {
        $startDate = $data['start_date'] ?? $sprint->start_date?->format('Y-m-d');
        $endDate = $data['end_date'] ?? $sprint->end_date?->format('Y-m-d');

        if ($startDate && $endDate && $endDate < $startDate) {
            throw ValidationException::withMessages([
                'end_date' => ['The end date cannot be earlier than the start date.'],
            ]);
        }

        return DB::transaction(function () use ($user, $sprint, $data) {
            $sprint->update([
                'name' => $data['name'] ?? $sprint->name,
                'goal' => array_key_exists('goal', $data) ? $data['goal'] : $sprint->goal,
                'start_date' => array_key_exists('start_date', $data) ? $data['start_date'] : $sprint->start_date,
                'end_date' => array_key_exists('end_date', $data) ? $data['end_date'] : $sprint->end_date,
            ]);

            ActivityLogger::log(
                $sprint->organization_id,
                $user->id,
                'sprint.updated',
                "Updated sprint '{$sprint->name}'",
                $sprint
            );

            return $sprint;
        });
    }
}

<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    public static function log(
        string $organizationId,
        ?string $userId,
        string $action,
        string $description,
        ?Model $subject = null,
        array $metadata = []
    ): ActivityLog {
        return ActivityLog::create([
            'organization_id' => $organizationId,
            'user_id' => $userId,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject ? (string) $subject->getKey() : null,
            'description' => $description,
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}

<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\ValidationException;

class AttachIssueLabel
{
    public function execute(User $actor, Issue $issue, Label $label): void
    {
        if ($label->organization_id !== $issue->organization_id) {
            throw ValidationException::withMessages([
                'label_id' => ['Label must belong to the same organization.'],
            ]);
        }

        if ($issue->labels()->where('label_id', $label->id)->exists()) {
            return; // Already attached
        }

        $issue->labels()->attach($label->id, ['created_at' => now()]);

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.label_added',
            "Attached label {$label->name} to issue {$issue->key}",
            $issue,
            ['label_id' => $label->id, 'label_name' => $label->name]
        );
    }
}

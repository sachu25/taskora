<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use App\Services\ActivityLogger;

class DetachIssueLabel
{
    public function execute(User $actor, Issue $issue, Label $label): void
    {
        $issue->labels()->detach($label->id);

        ActivityLogger::log(
            $issue->organization_id,
            $actor->id,
            'issue.label_removed',
            "Removed label {$label->name} from issue {$issue->key}",
            $issue,
            ['label_id' => $label->id, 'label_name' => $label->name]
        );
    }
}

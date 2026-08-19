<?php

namespace App\Domain\Project\Actions;

use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;

class DeleteProject
{
    public function execute(User $actor, Project $project): void
    {
        $orgId = $project->organization_id;
        $name = $project->name;

        $project->delete();

        ActivityLogger::log(
            $orgId,
            $actor->id,
            'project.deleted',
            "Deleted project {$name}"
        );
    }
}

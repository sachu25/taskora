<?php

namespace App\Domain\Issue\Actions;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateIssue
{
    public function execute(User $creator, Project $project, array $data): Issue
    {
        // 1. Validate Assignee if provided
        if (!empty($data['assignee_id'])) {
            $assignee = User::find($data['assignee_id']);
            if (!$assignee || !$assignee->belongsToOrganization($project->organization_id)) {
                throw ValidationException::withMessages([
                    'assignee_id' => ['The selected assignee must belong to the organization.'],
                ]);
            }
        }

        // 2. Validate Parent Issue if provided
        if (!empty($data['parent_id'])) {
            $parent = Issue::where('project_id', $project->id)
                ->where('id', $data['parent_id'])
                ->first();
            if (!$parent) {
                throw ValidationException::withMessages([
                    'parent_id' => ['The parent issue must exist within the same project.'],
                ]);
            }
        }

        return DB::transaction(function () use ($creator, $project, $data) {
            // Lock project row to safely derive next issue_number without race conditions
            Project::where('id', $project->id)->lockForUpdate()->first();

            $maxNumber = Issue::where('project_id', $project->id)
                ->withTrashed()
                ->max('issue_number') ?: 0;

            $issueNumber = $maxNumber + 1;

            $issue = Issue::create([
                'organization_id' => $project->organization_id,
                'project_id' => $project->id,
                'issue_number' => $issueNumber,
                'issue_type' => $data['issue_type'] ?? 'task',
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'todo',
                'priority' => $data['priority'] ?? 'medium',
                'severity' => $data['severity'] ?? null,
                'reporter_id' => $creator->id,
                'assignee_id' => $data['assignee_id'] ?? null,
                'parent_id' => $data['parent_id'] ?? null,
            ]);

            ActivityLogger::log(
                $project->organization_id,
                $creator->id,
                'issue.created',
                "Created issue {$issue->key}: {$issue->title}",
                $issue
            );

            return $issue;
        });
    }
}

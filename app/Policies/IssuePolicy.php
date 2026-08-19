<?php

namespace App\Policies;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;

class IssuePolicy
{
    public function view(User $user, Issue $issue): bool
    {
        if (!$user->belongsToOrganization($issue->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($issue->organization_id)) {
            return true;
        }

        $project = $issue->project;
        if ($project && $project->visibility === 'organization') {
            return true;
        }

        return $project && $project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Project $project): bool
    {
        if (!$user->belongsToOrganization($project->organization_id)) {
            return false;
        }

        $role = $user->getOrganizationRole($project->organization_id);
        return in_array($role, ['organization_admin', 'project_manager', 'developer', 'tester', 'reporter']);
    }

    public function update(User $user, Issue $issue): bool
    {
        if (!$user->belongsToOrganization($issue->organization_id)) {
            return false;
        }

        if ($user->isOrganizationAdmin($issue->organization_id)) {
            return true;
        }

        if ($issue->reporter_id === $user->id || $issue->assignee_id === $user->id) {
            return true;
        }

        $role = $user->getOrganizationRole($issue->organization_id);
        return in_array($role, ['project_manager', 'developer', 'tester']);
    }

    public function delete(User $user, Issue $issue): bool
    {
        if (!$user->belongsToOrganization($issue->organization_id)) {
            return false;
        }

        $role = $user->getOrganizationRole($issue->organization_id);
        return in_array($role, ['organization_admin', 'project_manager']);
    }

    public function restore(User $user, Issue $issue): bool
    {
        return $this->delete($user, $issue);
    }

    public function comment(User $user, Issue $issue): bool
    {
        return $this->view($user, $issue);
    }

    public function manageLabels(User $user, Issue $issue): bool
    {
        return $this->update($user, $issue);
    }

    public function manageWatchers(User $user, Issue $issue): bool
    {
        return $this->view($user, $issue);
    }

    public function manageLinks(User $user, Issue $issue): bool
    {
        return $this->update($user, $issue);
    }
}

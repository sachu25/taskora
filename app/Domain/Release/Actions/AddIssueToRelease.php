<?php

namespace App\Domain\Release\Actions;

use App\Models\Issue;
use App\Models\Release;
use App\Models\ReleaseIssue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddIssueToRelease
{
    public function execute(User $actor, Release $release, Issue $issue): ReleaseIssue
    {
        if ($release->isReleased() || $release->isCancelled()) {
            throw ValidationException::withMessages([
                'release' => ["Cannot add issue to a release with status '{$release->status}'."],
            ]);
        }

        if ($issue->organization_id !== $release->organization_id) {
            throw ValidationException::withMessages([
                'issue_id' => ['The selected issue belongs to a different organization.'],
            ]);
        }

        if ($issue->project_id !== $release->project_id) {
            throw ValidationException::withMessages([
                'issue_id' => ['The selected issue belongs to a different project.'],
            ]);
        }

        if ($issue->trashed()) {
            throw ValidationException::withMessages([
                'issue_id' => ['Cannot add a deleted issue to a release.'],
            ]);
        }

        $exists = ReleaseIssue::where('release_id', $release->id)
            ->where('issue_id', $issue->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'issue_id' => ['This issue is already assigned to this release.'],
            ]);
        }

        return DB::transaction(function () use ($actor, $release, $issue) {
            $releaseIssue = ReleaseIssue::create([
                'release_id' => $release->id,
                'issue_id' => $issue->id,
                'added_by' => $actor->id,
                'created_at' => now(),
            ]);

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.issue_added',
                "Added issue '{$issue->key}' to release '{$release->name}' ({$release->version})",
                $release
            );

            return $releaseIssue;
        });
    }
}

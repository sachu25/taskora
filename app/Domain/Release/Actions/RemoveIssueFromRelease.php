<?php

namespace App\Domain\Release\Actions;

use App\Models\Issue;
use App\Models\Release;
use App\Models\ReleaseIssue;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RemoveIssueFromRelease
{
    public function execute(User $actor, Release $release, Issue $issue): void
    {
        if ($release->isReleased() || $release->isCancelled()) {
            throw ValidationException::withMessages([
                'release' => ["Cannot remove issue from a release with status '{$release->status}'."],
            ]);
        }

        $releaseIssue = ReleaseIssue::where('release_id', $release->id)
            ->where('issue_id', $issue->id)
            ->first();

        if (!$releaseIssue) {
            throw ValidationException::withMessages([
                'issue_id' => ['The specified issue is not attached to this release.'],
            ]);
        }

        DB::transaction(function () use ($actor, $release, $issue, $releaseIssue) {
            $releaseIssue->delete();

            ActivityLogger::log(
                $release->organization_id,
                $actor->id,
                'release.issue_removed',
                "Removed issue '{$issue->key}' from release '{$release->name}' ({$release->version})",
                $release
            );
        });
    }
}

<?php

namespace App\Domain\QA\Actions;

use App\Models\Issue;
use App\Models\TestCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;

class UnlinkTestCaseFromIssue
{
    public function execute(User $actor, TestCase $testCase, Issue $issue): bool
    {
        return DB::transaction(function () use ($actor, $testCase, $issue) {
            DB::table('test_case_issues')
                ->where('test_case_id', $testCase->id)
                ->where('issue_id', $issue->id)
                ->delete();

            ActivityLogger::log(
                $testCase->organization_id,
                $actor->id,
                'qa.test_case_unlinked',
                "Unlinked test case {$testCase->key} from issue {$issue->key}",
                $testCase,
                ['issue_id' => $issue->id, 'issue_key' => $issue->key]
            );

            return true;
        });
    }
}

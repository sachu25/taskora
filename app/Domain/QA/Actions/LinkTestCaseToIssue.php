<?php

namespace App\Domain\QA\Actions;

use App\Models\Issue;
use App\Models\TestCase;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LinkTestCaseToIssue
{
    public function execute(User $actor, TestCase $testCase, Issue $issue): bool
    {
        // Boundary validation: Org and Project MUST match
        if ($testCase->organization_id !== $issue->organization_id || $testCase->project_id !== $issue->project_id) {
            throw ValidationException::withMessages([
                'issue_id' => ['The linked issue must belong to the same project and organization.'],
            ]);
        }

        return DB::transaction(function () use ($actor, $testCase, $issue) {
            $exists = DB::table('test_case_issues')
                ->where('test_case_id', $testCase->id)
                ->where('issue_id', $issue->id)
                ->exists();

            if (!$exists) {
                DB::table('test_case_issues')->insert([
                    'test_case_id' => $testCase->id,
                    'issue_id' => $issue->id,
                    'created_by' => $actor->id,
                    'created_at' => now(),
                ]);

                ActivityLogger::log(
                    $testCase->organization_id,
                    $actor->id,
                    'qa.test_case_linked',
                    "Linked test case {$testCase->key} to issue {$issue->key}",
                    $testCase,
                    ['issue_id' => $issue->id, 'issue_key' => $issue->key]
                );
            }

            return true;
        });
    }
}

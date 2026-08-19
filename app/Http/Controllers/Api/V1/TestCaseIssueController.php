<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\LinkTestCaseToIssue;
use App\Domain\QA\Actions\UnlinkTestCaseFromIssue;
use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\TestCase;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestCaseIssueController extends Controller
{
    use AuthorizesRequests;

    public function index(TestCase $case): JsonResponse
    {
        $this->authorize('view', $case);

        $issues = $case->issues;

        return response()->json([
            'success' => true,
            'message' => 'Linked issues retrieved successfully.',
            'data' => $issues->map(function ($issue) {
                return [
                    'id' => $issue->id,
                    'key' => $issue->key,
                    'title' => $issue->title,
                    'status' => $issue->status,
                    'priority' => $issue->priority,
                    'issue_type' => $issue->issue_type,
                ];
            }),
        ]);
    }

    public function store(Request $request, TestCase $case, LinkTestCaseToIssue $action): JsonResponse
    {
        $this->authorize('manageIssues', $case);

        $validated = $request->validate([
            'issue_id' => 'required|string|exists:issues,id',
        ]);

        $issue = Issue::findOrFail($validated['issue_id']);
        $action->execute($request->user(), $case, $issue);

        return response()->json([
            'success' => true,
            'message' => 'Test case linked to issue successfully.',
            'data' => null,
        ], 201);
    }

    public function destroy(Request $request, TestCase $case, Issue $issue, UnlinkTestCaseFromIssue $action): JsonResponse
    {
        $this->authorize('manageIssues', $case);

        $action->execute($request->user(), $case, $issue);

        return response()->json([
            'success' => true,
            'message' => 'Test case unlinked from issue successfully.',
            'data' => null,
        ]);
    }
}

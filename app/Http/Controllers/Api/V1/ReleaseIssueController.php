<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Release\Actions\AddIssueToRelease;
use App\Domain\Release\Actions\RemoveIssueFromRelease;
use App\Http\Controllers\Controller;
use App\Http\Requests\Release\AddReleaseIssueRequest;
use App\Http\Resources\ReleaseIssueResource;
use App\Models\Issue;
use App\Models\Release;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReleaseIssueController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Release $release): JsonResponse
    {
        $this->authorize('view', $release);

        $releaseIssues = $release->releaseIssues()
            ->with(['issue.project', 'addedBy'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Release issues retrieved successfully.',
            'data' => ReleaseIssueResource::collection($releaseIssues),
        ]);
    }

    public function store(AddReleaseIssueRequest $request, Release $release, AddIssueToRelease $action): JsonResponse
    {
        $this->authorize('manageIssues', $release);

        $issue = Issue::findOrFail($request->validated('issue_id'));
        $releaseIssue = $action->execute($request->user(), $release, $issue);
        $releaseIssue->load(['issue.project', 'addedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Issue added to release successfully.',
            'data' => new ReleaseIssueResource($releaseIssue),
        ], 201);
    }

    public function destroy(Request $request, Release $release, Issue $issue, RemoveIssueFromRelease $action): JsonResponse
    {
        $this->authorize('manageIssues', $release);

        $action->execute($request->user(), $release, $issue);

        return response()->json([
            'success' => true,
            'message' => 'Issue removed from release successfully.',
            'data' => null,
        ]);
    }
}

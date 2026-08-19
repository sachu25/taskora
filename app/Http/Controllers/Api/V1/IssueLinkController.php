<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Issue\Actions\CreateIssueLink;
use App\Domain\Issue\Actions\DeleteIssueLink;
use App\Http\Controllers\Controller;
use App\Http\Resources\IssueLinkResource;
use App\Models\Issue;
use App\Models\IssueLink;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueLinkController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Issue $issue): JsonResponse
    {
        $this->authorize('view', $issue);

        $links = $issue->links()->with('linkedIssue')->get();

        return $this->successResponse(
            IssueLinkResource::collection($links),
            'Issue links retrieved'
        );
    }

    public function store(Request $request, Issue $issue, CreateIssueLink $action): JsonResponse
    {
        $this->authorize('manageLinks', $issue);

        $validated = $request->validate([
            'linked_issue_id' => ['required', 'string', 'exists:issues,id'],
            'link_type' => ['required', 'string', 'in:blocks,blocked_by,duplicates,duplicated_by,relates_to'],
        ]);

        $link = $action->execute(
            $request->user(),
            $issue,
            $validated['linked_issue_id'],
            $validated['link_type']
        );
        $link->load('linkedIssue');

        return $this->successResponse(
            new IssueLinkResource($link),
            'Issue link created successfully',
            201
        );
    }

    public function destroy(IssueLink $link, DeleteIssueLink $action): JsonResponse
    {
        if (auth()->user()->cannot('update', $link->issue)) {
            return $this->errorResponse('Unauthorized to delete issue link.', 403);
        }

        $action->execute(auth()->user(), $link);

        return $this->successResponse(null, 'Issue link removed successfully');
    }
}

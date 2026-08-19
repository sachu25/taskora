<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Issue\Actions\AddIssueComment;
use App\Domain\Issue\Actions\DeleteIssueComment;
use App\Domain\Issue\Actions\UpdateIssueComment;
use App\Http\Controllers\Controller;
use App\Http\Resources\IssueCommentResource;
use App\Models\Issue;
use App\Models\IssueComment;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueCommentController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Issue $issue): JsonResponse
    {
        $this->authorize('view', $issue);

        $comments = $issue->comments()->with('user')->orderBy('created_at', 'asc')->get();

        return $this->successResponse(
            IssueCommentResource::collection($comments),
            'Issue comments retrieved'
        );
    }

    public function store(Request $request, Issue $issue, AddIssueComment $action): JsonResponse
    {
        $this->authorize('comment', $issue);

        $validated = $request->validate([
            'body' => ['required', 'string'],
        ]);

        $comment = $action->execute($request->user(), $issue, $validated['body']);
        $comment->load('user');

        return $this->successResponse(
            new IssueCommentResource($comment),
            'Comment added successfully',
            201
        );
    }

    public function update(Request $request, IssueComment $comment, UpdateIssueComment $action): JsonResponse
    {
        $this->authorize('update', $comment);

        $validated = $request->validate([
            'body' => ['required', 'string'],
        ]);

        $updated = $action->execute($request->user(), $comment, $validated['body']);
        $updated->load('user');

        return $this->successResponse(
            new IssueCommentResource($updated),
            'Comment updated successfully'
        );
    }

    public function destroy(IssueComment $comment, DeleteIssueComment $action): JsonResponse
    {
        $this->authorize('delete', $comment);

        $action->execute(auth()->user(), $comment);

        return $this->successResponse(null, 'Comment deleted successfully');
    }
}

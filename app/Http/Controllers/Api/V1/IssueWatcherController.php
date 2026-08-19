<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Issue\Actions\AddIssueWatcher;
use App\Domain\Issue\Actions\RemoveIssueWatcher;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Issue;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueWatcherController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Issue $issue): JsonResponse
    {
        $this->authorize('view', $issue);

        $watchers = $issue->watchers;

        return $this->successResponse(
            UserResource::collection($watchers),
            'Issue watchers retrieved'
        );
    }

    public function store(Request $request, Issue $issue, AddIssueWatcher $action): JsonResponse
    {
        $this->authorize('manageWatchers', $issue);

        $targetUser = null;
        if ($request->filled('user_id')) {
            $targetUser = User::findOrFail($request->input('user_id'));
        }

        $action->execute($request->user(), $issue, $targetUser);

        return $this->successResponse(null, 'User added as watcher to issue');
    }

    public function destroy(Issue $issue, User $user, RemoveIssueWatcher $action): JsonResponse
    {
        $this->authorize('manageWatchers', $issue);

        $action->execute(auth()->user(), $issue, $user);

        return $this->successResponse(null, 'User removed from watchers');
    }
}

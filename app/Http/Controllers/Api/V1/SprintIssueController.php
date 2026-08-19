<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Sprint\Actions\AddIssueToSprint;
use App\Domain\Sprint\Actions\RemoveIssueFromSprint;
use App\Domain\Sprint\Actions\ReorderSprintIssue;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sprint\AddSprintIssueRequest;
use App\Http\Requests\Sprint\ReorderSprintIssueRequest;
use App\Http\Resources\SprintIssueResource;
use App\Models\Issue;
use App\Models\Sprint;
use App\Models\SprintIssue;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SprintIssueController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Sprint $sprint): JsonResponse
    {
        $this->authorize('view', $sprint);

        $query = SprintIssue::where('sprint_id', $sprint->id)
            ->with(['issue.project', 'issue.reporter', 'issue.assignee', 'issue.labels', 'addedBy']);

        if ($request->filled('status')) {
            $status = $request->query('status');
            $query->whereHas('issue', fn ($q) => $q->where('status', $status));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('issue', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('issue_number', $search);
            });
        }

        $perPage = min((int) $request->query('per_page', 50), 100);
        $sprintIssues = $query->orderBy('position', 'asc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Sprint issues retrieved successfully.',
            'data' => [
                'items' => SprintIssueResource::collection($sprintIssues->items()),
                'pagination' => [
                    'current_page' => $sprintIssues->currentPage(),
                    'per_page' => $sprintIssues->perPage(),
                    'total' => $sprintIssues->total(),
                    'last_page' => $sprintIssues->lastPage(),
                ],
            ],
        ]);
    }

    public function store(AddSprintIssueRequest $request, Sprint $sprint, AddIssueToSprint $action): JsonResponse
    {
        $this->authorize('manageIssues', $sprint);

        $issue = Issue::findOrFail($request->validated('issue_id'));

        $sprintIssue = $action->execute(
            $request->user(),
            $sprint,
            $issue,
            $request->validated('position')
        );

        $sprintIssue->load(['issue.project', 'issue.reporter', 'issue.assignee', 'issue.labels', 'addedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Issue added to sprint successfully.',
            'data' => new SprintIssueResource($sprintIssue),
        ], 201);
    }

    public function destroy(Request $request, Sprint $sprint, Issue $issue, RemoveIssueFromSprint $action): JsonResponse
    {
        $this->authorize('manageIssues', $sprint);

        $action->execute($request->user(), $sprint, $issue);

        return response()->json([
            'success' => true,
            'message' => 'Issue removed from sprint successfully.',
            'data' => null,
        ]);
    }

    public function reorder(ReorderSprintIssueRequest $request, Sprint $sprint, Issue $issue, ReorderSprintIssue $action): JsonResponse
    {
        $this->authorize('manageIssues', $sprint);

        $sprintIssue = $action->execute(
            $request->user(),
            $sprint,
            $issue,
            $request->validated('position')
        );

        $sprintIssue->load(['issue.project', 'issue.reporter', 'issue.assignee', 'issue.labels', 'addedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint issue reordered successfully.',
            'data' => new SprintIssueResource($sprintIssue),
        ]);
    }
}

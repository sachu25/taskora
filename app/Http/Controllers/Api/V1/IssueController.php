<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Issue\Actions\CreateIssue;
use App\Domain\Issue\Actions\DeleteIssue;
use App\Domain\Issue\Actions\RestoreIssue;
use App\Domain\Issue\Actions\UpdateIssue;
use App\Http\Controllers\Controller;
use App\Http\Resources\IssueResource;
use App\Models\Issue;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $query = Issue::where('project_id', $project->id)
            ->with(['reporter', 'assignee', 'labels', 'project'])
            ->withCount(['watchers', 'comments']);

        // Filters
        if ($request->filled('type')) {
            $query->where('issue_type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->input('severity'));
        }

        if ($request->filled('assignee')) {
            $query->where('assignee_id', $request->input('assignee'));
        }

        if ($request->filled('reporter')) {
            $query->where('reporter_id', $request->input('reporter'));
        }

        if ($request->filled('label')) {
            $query->whereHas('labels', function ($q) use ($request) {
                $q->where('labels.id', $request->input('label'))
                  ->orWhere('labels.name', $request->input('label'));
            });
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search, $project) {
                $q->where('title', 'like', "%{$search}%");
                if (is_numeric($search)) {
                    $q->orWhere('issue_number', (int) $search);
                }
                $keySearch = strtoupper($search);
                if (str_starts_with($keySearch, $project->key . '-')) {
                    $num = (int) str_replace($project->key . '-', '', $keySearch);
                    if ($num > 0) {
                        $q->orWhere('issue_number', $num);
                    }
                }
            });
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $issues = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Issues retrieved successfully',
            'data' => [
                'items' => IssueResource::collection($issues->items()),
                'pagination' => [
                    'current_page' => $issues->currentPage(),
                    'per_page' => $issues->perPage(),
                    'total' => $issues->total(),
                    'last_page' => $issues->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request, Project $project, CreateIssue $action): JsonResponse
    {
        $this->authorize('create', [Issue::class, $project]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'issue_type' => ['nullable', 'string', 'in:bug,task,story,feature,improvement'],
            'status' => ['nullable', 'string', 'in:backlog,todo,in_progress,done'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'severity' => ['nullable', 'string', 'in:minor,major,critical,blocker'],
            'assignee_id' => ['nullable', 'string', 'exists:users,id'],
            'parent_id' => ['nullable', 'string', 'exists:issues,id'],
        ]);

        $issue = $action->execute($request->user(), $project, $validated);
        $issue->load(['reporter', 'assignee', 'labels', 'project']);

        return $this->successResponse(
            new IssueResource($issue),
            'Issue created successfully',
            201
        );
    }

    public function show(Issue $issue): JsonResponse
    {
        $this->authorize('view', $issue);

        $issue->load(['reporter', 'assignee', 'labels', 'parent', 'children', 'project'])
            ->loadCount(['watchers', 'comments']);

        return $this->successResponse(
            new IssueResource($issue),
            'Issue details retrieved'
        );
    }

    public function update(Request $request, Issue $issue, UpdateIssue $action): JsonResponse
    {
        $this->authorize('update', $issue);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'issue_type' => ['sometimes', 'string', 'in:bug,task,story,feature,improvement'],
            'status' => ['sometimes', 'string', 'in:backlog,todo,in_progress,done'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high,urgent'],
            'severity' => ['nullable', 'string', 'in:minor,major,critical,blocker'],
            'assignee_id' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'string'],
        ]);

        $updated = $action->execute($request->user(), $issue, $validated);
        $updated->load(['reporter', 'assignee', 'labels', 'project']);

        return $this->successResponse(
            new IssueResource($updated),
            'Issue updated successfully'
        );
    }

    public function destroy(Issue $issue, DeleteIssue $action): JsonResponse
    {
        $this->authorize('delete', $issue);

        $action->execute(auth()->user(), $issue);

        return $this->successResponse(null, 'Issue soft-deleted successfully');
    }

    public function restore(string $id, RestoreIssue $action): JsonResponse
    {
        $issue = Issue::withTrashed()->findOrFail($id);

        $this->authorize('restore', $issue);

        $restored = $action->execute(auth()->user(), $issue);
        $restored->load(['reporter', 'assignee', 'labels', 'project']);

        return $this->successResponse(
            new IssueResource($restored),
            'Issue restored successfully'
        );
    }
}

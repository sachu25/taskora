<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\IssueResource;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BacklogController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Issue::class, $project]);

        // Get IDs of issues currently assigned to planned or active sprints in this project
        $scheduledIssueIds = Sprint::where('project_id', $project->id)
            ->whereIn('status', ['planned', 'active'])
            ->join('sprint_issues', 'sprints.id', '=', 'sprint_issues.sprint_id')
            ->pluck('sprint_issues.issue_id');

        $query = Issue::where('project_id', $project->id)
            ->whereNotIn('id', $scheduledIssueIds)
            ->with(['reporter', 'assignee', 'labels', 'project']);

        if ($request->filled('type')) {
            $query->where('issue_type', $request->query('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->query('priority'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('issue_number', $search);
            });
        }

        $perPage = min((int) $request->query('per_page', 25), 100);

        $backlogIssues = $query->orderByRaw('backlog_position ASC NULLS LAST')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Backlog issues retrieved successfully.',
            'data' => [
                'items' => IssueResource::collection($backlogIssues->items()),
                'pagination' => [
                    'current_page' => $backlogIssues->currentPage(),
                    'per_page' => $backlogIssues->perPage(),
                    'total' => $backlogIssues->total(),
                    'last_page' => $backlogIssues->lastPage(),
                ],
            ],
        ]);
    }

    public function reorder(Request $request, Project $project, Issue $issue): JsonResponse
    {
        $this->authorize('update', $issue);

        $request->validate([
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $issue->update(['backlog_position' => $request->input('position')]);
        $issue->load(['reporter', 'assignee', 'labels', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Backlog position updated successfully.',
            'data' => new IssueResource($issue),
        ]);
    }
}

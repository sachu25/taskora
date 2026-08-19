<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\ActivityLog;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Release;
use App\Models\Sprint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $orgId = $request->header('X-Organization-Id') ?? $user->organizationMembers()->first()?->organization_id;

        if (! $orgId || ! $user->belongsToOrganization($orgId)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized organization context',
            ], 403);
        }

        $query = ActivityLog::with('user')
            ->where('organization_id', $orgId);

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        $perPage = min((int) $request->query('per_page', 20), 100);
        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Activity logs retrieved successfully',
            'data' => [
                'items' => ActivityResource::collection($activities->items()),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                    'last_page' => $activities->lastPage(),
                ],
            ],
        ]);
    }

    public function project(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();

        if (! $user->belongsToOrganization($project->organization_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized project access',
            ], 403);
        }

        $query = ActivityLog::with('user')
            ->where('organization_id', $project->organization_id)
            ->where(function ($q) use ($project) {
                $q->where(function ($sq) use ($project) {
                    $sq->where('subject_type', Project::class)
                       ->where('subject_id', $project->id);
                })->orWhere(function ($sq) use ($project) {
                    $sq->whereIn('subject_type', [Issue::class, Sprint::class, Release::class])
                       ->whereRaw("json_extract(metadata, '$.project_id') = ?", [$project->id]);
                });
            });

        $perPage = min((int) $request->query('per_page', 20), 100);
        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Project activity logs retrieved',
            'data' => [
                'items' => ActivityResource::collection($activities->items()),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                    'last_page' => $activities->lastPage(),
                ],
            ],
        ]);
    }

    public function issue(Request $request, Issue $issue): JsonResponse
    {
        $user = Auth::user();

        if (! $user->belongsToOrganization($issue->organization_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized issue access',
            ], 403);
        }

        $activities = ActivityLog::with('user')
            ->where('organization_id', $issue->organization_id)
            ->where('subject_type', Issue::class)
            ->where('subject_id', $issue->id)
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) $request->query('per_page', 20), 100));

        return response()->json([
            'success' => true,
            'message' => 'Issue activity logs retrieved',
            'data' => [
                'items' => ActivityResource::collection($activities->items()),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                    'last_page' => $activities->lastPage(),
                ],
            ],
        ]);
    }

    public function sprint(Request $request, Sprint $sprint): JsonResponse
    {
        $user = Auth::user();

        if (! $user->belongsToOrganization($sprint->organization_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized sprint access',
            ], 403);
        }

        $activities = ActivityLog::with('user')
            ->where('organization_id', $sprint->organization_id)
            ->where('subject_type', Sprint::class)
            ->where('subject_id', $sprint->id)
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) $request->query('per_page', 20), 100));

        return response()->json([
            'success' => true,
            'message' => 'Sprint activity logs retrieved',
            'data' => [
                'items' => ActivityResource::collection($activities->items()),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                    'last_page' => $activities->lastPage(),
                ],
            ],
        ]);
    }

    public function release(Request $request, Release $release): JsonResponse
    {
        $user = Auth::user();

        if (! $user->belongsToOrganization($release->organization_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized release access',
            ], 403);
        }

        $activities = ActivityLog::with('user')
            ->where('organization_id', $release->organization_id)
            ->where('subject_type', Release::class)
            ->where('subject_id', $release->id)
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) $request->query('per_page', 20), 100));

        return response()->json([
            'success' => true,
            'message' => 'Release activity logs retrieved',
            'data' => [
                'items' => ActivityResource::collection($activities->items()),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                    'last_page' => $activities->lastPage(),
                ],
            ],
        ]);
    }
}

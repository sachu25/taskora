<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Release\Actions\AssignReleaseManager;
use App\Domain\Release\Actions\CancelRelease;
use App\Domain\Release\Actions\CompleteRelease;
use App\Domain\Release\Actions\CreateRelease;
use App\Domain\Release\Actions\DeleteRelease;
use App\Domain\Release\Actions\RemoveReleaseManager;
use App\Domain\Release\Actions\RestoreRelease;
use App\Domain\Release\Actions\StartRelease;
use App\Domain\Release\Actions\UpdateRelease;
use App\Http\Controllers\Controller;
use App\Http\Requests\Release\AssignReleaseManagerRequest;
use App\Http\Requests\Release\StoreReleaseRequest;
use App\Http\Requests\Release\UpdateReleaseRequest;
use App\Http\Resources\ReleaseResource;
use App\Models\Project;
use App\Models\Release;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReleaseController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('viewAny', [Release::class, $project]);

        $query = Release::where('project_id', $project->id)
            ->with(['creator', 'releaseManager', 'project'])
            ->withCount('issues');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('version')) {
            $query->where('version', $request->query('version'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('version', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $releases = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Releases retrieved successfully.',
            'data' => [
                'items' => ReleaseResource::collection($releases->items()),
                'pagination' => [
                    'current_page' => $releases->currentPage(),
                    'per_page' => $releases->perPage(),
                    'total' => $releases->total(),
                    'last_page' => $releases->lastPage(),
                ],
            ],
        ]);
    }

    public function store(StoreReleaseRequest $request, Project $project, CreateRelease $action): JsonResponse
    {
        $this->authorize('create', [Release::class, $project]);

        $release = $action->execute($request->user(), $project, $request->validated());
        $release->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release created successfully.',
            'data' => new ReleaseResource($release),
        ], 201);
    }

    public function show(Release $release): JsonResponse
    {
        $this->authorize('view', $release);

        $release->load(['creator', 'releaseManager', 'project'])->loadCount('issues');

        return response()->json([
            'success' => true,
            'message' => 'Release details retrieved successfully.',
            'data' => new ReleaseResource($release),
        ]);
    }

    public function update(UpdateReleaseRequest $request, Release $release, UpdateRelease $action): JsonResponse
    {
        $this->authorize('update', $release);

        $updated = $action->execute($request->user(), $release, $request->validated());
        $updated->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release updated successfully.',
            'data' => new ReleaseResource($updated),
        ]);
    }

    public function destroy(Request $request, Release $release, DeleteRelease $action): JsonResponse
    {
        $this->authorize('delete', $release);

        $action->execute($request->user(), $release);

        return response()->json([
            'success' => true,
            'message' => 'Release soft-deleted successfully.',
            'data' => null,
        ]);
    }

    public function restore(Request $request, string $id, RestoreRelease $action): JsonResponse
    {
        $release = Release::withTrashed()->findOrFail($id);
        $this->authorize('restore', $release);

        $restored = $action->execute($request->user(), $release);
        $restored->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release restored successfully.',
            'data' => new ReleaseResource($restored),
        ]);
    }

    public function start(Request $request, Release $release, StartRelease $action): JsonResponse
    {
        $this->authorize('start', $release);

        $started = $action->execute($request->user(), $release);
        $started->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release started successfully.',
            'data' => new ReleaseResource($started),
        ]);
    }

    public function complete(Request $request, Release $release, CompleteRelease $action): JsonResponse
    {
        $this->authorize('complete', $release);

        $completed = $action->execute($request->user(), $release);
        $completed->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release completed successfully.',
            'data' => new ReleaseResource($completed),
        ]);
    }

    public function cancel(Request $request, Release $release, CancelRelease $action): JsonResponse
    {
        $this->authorize('cancel', $release);

        $cancelled = $action->execute($request->user(), $release);
        $cancelled->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release cancelled successfully.',
            'data' => new ReleaseResource($cancelled),
        ]);
    }

    public function assignManager(AssignReleaseManagerRequest $request, Release $release, AssignReleaseManager $action): JsonResponse
    {
        $this->authorize('manageReleaseManager', $release);

        $manager = User::findOrFail($request->validated('user_id'));
        $updated = $action->execute($request->user(), $release, $manager);
        $updated->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release manager assigned successfully.',
            'data' => new ReleaseResource($updated),
        ]);
    }

    public function removeManager(Request $request, Release $release, RemoveReleaseManager $action): JsonResponse
    {
        $this->authorize('manageReleaseManager', $release);

        $updated = $action->execute($request->user(), $release);
        $updated->load(['creator', 'releaseManager', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Release manager removed successfully.',
            'data' => new ReleaseResource($updated),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Sprint\Actions\CancelSprint;
use App\Domain\Sprint\Actions\CompleteSprint;
use App\Domain\Sprint\Actions\CreateSprint;
use App\Domain\Sprint\Actions\DeleteSprint;
use App\Domain\Sprint\Actions\RestoreSprint;
use App\Domain\Sprint\Actions\StartSprint;
use App\Domain\Sprint\Actions\UpdateSprint;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sprint\StoreSprintRequest;
use App\Http\Requests\Sprint\UpdateSprintRequest;
use App\Http\Resources\SprintResource;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('viewAny', [Sprint::class, $project]);

        $query = Sprint::where('project_id', $project->id)
            ->with(['creator', 'project'])
            ->withCount('issues');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('goal', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $sprints = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Sprints retrieved successfully.',
            'data' => [
                'items' => SprintResource::collection($sprints->items()),
                'pagination' => [
                    'current_page' => $sprints->currentPage(),
                    'per_page' => $sprints->perPage(),
                    'total' => $sprints->total(),
                    'last_page' => $sprints->lastPage(),
                ],
            ],
        ]);
    }

    public function store(StoreSprintRequest $request, Project $project, CreateSprint $action): JsonResponse
    {
        $this->authorize('create', [Sprint::class, $project]);

        $sprint = $action->execute($request->user(), $project, $request->validated());
        $sprint->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint created successfully.',
            'data' => new SprintResource($sprint),
        ], 201);
    }

    public function show(Sprint $sprint): JsonResponse
    {
        $this->authorize('view', $sprint);

        $sprint->load(['creator', 'project'])->loadCount('issues');

        return response()->json([
            'success' => true,
            'message' => 'Sprint details retrieved successfully.',
            'data' => new SprintResource($sprint),
        ]);
    }

    public function update(UpdateSprintRequest $request, Sprint $sprint, UpdateSprint $action): JsonResponse
    {
        $this->authorize('update', $sprint);

        $updated = $action->execute($request->user(), $sprint, $request->validated());
        $updated->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint updated successfully.',
            'data' => new SprintResource($updated),
        ]);
    }

    public function destroy(Request $request, Sprint $sprint, DeleteSprint $action): JsonResponse
    {
        $this->authorize('delete', $sprint);

        $action->execute($request->user(), $sprint);

        return response()->json([
            'success' => true,
            'message' => 'Sprint soft-deleted successfully.',
            'data' => null,
        ]);
    }

    public function restore(Request $request, string $id, RestoreSprint $action): JsonResponse
    {
        $sprint = Sprint::withTrashed()->findOrFail($id);
        $this->authorize('restore', $sprint);

        $restored = $action->execute($request->user(), $sprint);
        $restored->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint restored successfully.',
            'data' => new SprintResource($restored),
        ]);
    }

    public function start(Request $request, Sprint $sprint, StartSprint $action): JsonResponse
    {
        $this->authorize('start', $sprint);

        $started = $action->execute($request->user(), $sprint, $request->only(['start_date', 'end_date']));
        $started->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint started successfully.',
            'data' => new SprintResource($started),
        ]);
    }

    public function complete(Request $request, Sprint $sprint, CompleteSprint $action): JsonResponse
    {
        $this->authorize('complete', $sprint);

        $completed = $action->execute($request->user(), $sprint);
        $completed->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint completed successfully.',
            'data' => new SprintResource($completed),
        ]);
    }

    public function cancel(Request $request, Sprint $sprint, CancelSprint $action): JsonResponse
    {
        $this->authorize('cancel', $sprint);

        $cancelled = $action->execute($request->user(), $sprint);
        $cancelled->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Sprint cancelled successfully.',
            'data' => new SprintResource($cancelled),
        ]);
    }
}

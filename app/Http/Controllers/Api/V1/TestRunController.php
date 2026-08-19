<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\CancelTestRun;
use App\Domain\QA\Actions\CompleteTestRun;
use App\Domain\QA\Actions\CreateTestRun;
use App\Domain\QA\Actions\DeleteTestRun;
use App\Domain\QA\Actions\RestoreTestRun;
use App\Domain\QA\Actions\StartTestRun;
use App\Domain\QA\Actions\UpdateTestRun;
use App\Http\Controllers\Controller;
use App\Http\Resources\TestRunResource;
use App\Models\Project;
use App\Models\TestRun;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestRunController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('viewAny', [TestRun::class, $project]);

        $query = TestRun::where('project_id', $project->id)
            ->with(['creator', 'project'])
            ->withCount('runCases');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('environment')) {
            $query->where('environment', $request->query('environment'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $runs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Test runs retrieved successfully.',
            'data' => [
                'items' => TestRunResource::collection($runs->items()),
                'pagination' => [
                    'current_page' => $runs->currentPage(),
                    'per_page' => $runs->perPage(),
                    'total' => $runs->total(),
                    'last_page' => $runs->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request, Project $project, CreateTestRun $action): JsonResponse
    {
        $this->authorize('create', [TestRun::class, $project]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'environment' => 'nullable|string|max:100',
        ]);

        $run = $action->execute($request->user(), $project, $validated);
        $run->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test run created successfully.',
            'data' => new TestRunResource($run),
        ], 201);
    }

    public function show(TestRun $run): JsonResponse
    {
        $this->authorize('view', $run);

        $run->load(['creator', 'project'])->loadCount('runCases');

        return response()->json([
            'success' => true,
            'message' => 'Test run details retrieved successfully.',
            'data' => new TestRunResource($run),
        ]);
    }

    public function update(Request $request, TestRun $run, UpdateTestRun $action): JsonResponse
    {
        $this->authorize('update', $run);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'environment' => 'nullable|string|max:100',
        ]);

        $updated = $action->execute($request->user(), $run, $validated);
        $updated->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test run updated successfully.',
            'data' => new TestRunResource($updated),
        ]);
    }

    public function destroy(Request $request, TestRun $run, DeleteTestRun $action): JsonResponse
    {
        $this->authorize('delete', $run);

        $action->execute($request->user(), $run);

        return response()->json([
            'success' => true,
            'message' => 'Test run soft-deleted successfully.',
            'data' => null,
        ]);
    }

    public function restore(Request $request, string $id, RestoreTestRun $action): JsonResponse
    {
        $run = TestRun::withTrashed()->findOrFail($id);
        $this->authorize('restore', $run);

        $restored = $action->execute($request->user(), $run);
        $restored->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test run restored successfully.',
            'data' => new TestRunResource($restored),
        ]);
    }

    public function start(Request $request, TestRun $run, StartTestRun $action): JsonResponse
    {
        $this->authorize('start', $run);

        $started = $action->execute($request->user(), $run);
        $started->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test run started successfully.',
            'data' => new TestRunResource($started),
        ]);
    }

    public function complete(Request $request, TestRun $run, CompleteTestRun $action): JsonResponse
    {
        $this->authorize('complete', $run);

        $completed = $action->execute($request->user(), $run);
        $completed->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test run completed successfully.',
            'data' => new TestRunResource($completed),
        ]);
    }

    public function cancel(Request $request, TestRun $run, CancelTestRun $action): JsonResponse
    {
        $this->authorize('cancel', $run);

        $cancelled = $action->execute($request->user(), $run);
        $cancelled->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test run cancelled successfully.',
            'data' => new TestRunResource($cancelled),
        ]);
    }
}

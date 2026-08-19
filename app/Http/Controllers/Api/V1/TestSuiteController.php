<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\CreateTestSuite;
use App\Domain\QA\Actions\DeleteTestSuite;
use App\Domain\QA\Actions\RestoreTestSuite;
use App\Domain\QA\Actions\UpdateTestSuite;
use App\Http\Controllers\Controller;
use App\Http\Resources\TestSuiteResource;
use App\Models\Project;
use App\Models\TestSuite;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestSuiteController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('viewAny', [TestSuite::class, $project]);

        $query = TestSuite::where('project_id', $project->id)
            ->with(['creator', 'project'])
            ->withCount('testCases');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $suites = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Test suites retrieved successfully.',
            'data' => [
                'items' => TestSuiteResource::collection($suites->items()),
                'pagination' => [
                    'current_page' => $suites->currentPage(),
                    'per_page' => $suites->perPage(),
                    'total' => $suites->total(),
                    'last_page' => $suites->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request, Project $project, CreateTestSuite $action): JsonResponse
    {
        $this->authorize('create', [TestSuite::class, $project]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,archived',
        ]);

        $suite = $action->execute($request->user(), $project, $validated);
        $suite->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test suite created successfully.',
            'data' => new TestSuiteResource($suite),
        ], 201);
    }

    public function show(TestSuite $suite): JsonResponse
    {
        $this->authorize('view', $suite);

        $suite->load(['creator', 'project'])->loadCount('testCases');

        return response()->json([
            'success' => true,
            'message' => 'Test suite details retrieved successfully.',
            'data' => new TestSuiteResource($suite),
        ]);
    }

    public function update(Request $request, TestSuite $suite, UpdateTestSuite $action): JsonResponse
    {
        $this->authorize('update', $suite);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:active,archived',
        ]);

        $updated = $action->execute($request->user(), $suite, $validated);
        $updated->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test suite updated successfully.',
            'data' => new TestSuiteResource($updated),
        ]);
    }

    public function destroy(Request $request, TestSuite $suite, DeleteTestSuite $action): JsonResponse
    {
        $this->authorize('delete', $suite);

        $action->execute($request->user(), $suite);

        return response()->json([
            'success' => true,
            'message' => 'Test suite soft-deleted successfully.',
            'data' => null,
        ]);
    }

    public function restore(Request $request, string $id, RestoreTestSuite $action): JsonResponse
    {
        $suite = TestSuite::withTrashed()->findOrFail($id);
        $this->authorize('restore', $suite);

        $restored = $action->execute($request->user(), $suite);
        $restored->load(['creator', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Test suite restored successfully.',
            'data' => new TestSuiteResource($restored),
        ]);
    }
}

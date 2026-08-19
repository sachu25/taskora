<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\CreateTestCase;
use App\Domain\QA\Actions\DeleteTestCase;
use App\Domain\QA\Actions\RestoreTestCase;
use App\Domain\QA\Actions\UpdateTestCase;
use App\Http\Controllers\Controller;
use App\Http\Resources\TestCaseResource;
use App\Models\Project;
use App\Models\TestCase;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestCaseController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('viewAny', [TestCase::class, $project]);

        $query = TestCase::where('project_id', $project->id)
            ->with(['creator', 'project', 'suite', 'steps', 'issues']);

        if ($request->filled('suite_id')) {
            $query->where('suite_id', $request->query('suite_id'));
        }

        if ($request->filled('test_type')) {
            $query->where('test_type', $request->query('test_type'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->query('priority'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('preconditions', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $testCases = $query->orderBy('case_number', 'asc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Test cases retrieved successfully.',
            'data' => [
                'items' => TestCaseResource::collection($testCases->items()),
                'pagination' => [
                    'current_page' => $testCases->currentPage(),
                    'per_page' => $testCases->perPage(),
                    'total' => $testCases->total(),
                    'last_page' => $testCases->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request, Project $project, CreateTestCase $action): JsonResponse
    {
        $this->authorize('create', [TestCase::class, $project]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'suite_id' => 'nullable|string|exists:test_suites,id',
            'description' => 'nullable|string',
            'preconditions' => 'nullable|string',
            'test_type' => 'nullable|in:functional,regression,smoke,integration,acceptance,usability,performance,security',
            'priority' => 'nullable|in:low,medium,high,critical',
            'status' => 'nullable|in:draft,ready,deprecated',
        ]);

        $testCase = $action->execute($request->user(), $project, $validated);
        $testCase->load(['creator', 'project', 'suite', 'steps', 'issues']);

        return response()->json([
            'success' => true,
            'message' => 'Test case created successfully.',
            'data' => new TestCaseResource($testCase),
        ], 201);
    }

    public function show(TestCase $case): JsonResponse
    {
        $this->authorize('view', $case);

        $case->load(['creator', 'project', 'suite', 'steps', 'issues']);

        return response()->json([
            'success' => true,
            'message' => 'Test case details retrieved successfully.',
            'data' => new TestCaseResource($case),
        ]);
    }

    public function update(Request $request, TestCase $case, UpdateTestCase $action): JsonResponse
    {
        $this->authorize('update', $case);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'suite_id' => 'nullable|string|exists:test_suites,id',
            'description' => 'nullable|string',
            'preconditions' => 'nullable|string',
            'test_type' => 'sometimes|required|in:functional,regression,smoke,integration,acceptance,usability,performance,security',
            'priority' => 'sometimes|required|in:low,medium,high,critical',
            'status' => 'sometimes|required|in:draft,ready,deprecated',
        ]);

        $updated = $action->execute($request->user(), $case, $validated);
        $updated->load(['creator', 'project', 'suite', 'steps', 'issues']);

        return response()->json([
            'success' => true,
            'message' => 'Test case updated successfully.',
            'data' => new TestCaseResource($updated),
        ]);
    }

    public function destroy(Request $request, TestCase $case, DeleteTestCase $action): JsonResponse
    {
        $this->authorize('delete', $case);

        $action->execute($request->user(), $case);

        return response()->json([
            'success' => true,
            'message' => 'Test case soft-deleted successfully.',
            'data' => null,
        ]);
    }

    public function restore(Request $request, string $id, RestoreTestCase $action): JsonResponse
    {
        $case = TestCase::withTrashed()->findOrFail($id);
        $this->authorize('restore', $case);

        $restored = $action->execute($request->user(), $case);
        $restored->load(['creator', 'project', 'suite', 'steps', 'issues']);

        return response()->json([
            'success' => true,
            'message' => 'Test case restored successfully.',
            'data' => new TestCaseResource($restored),
        ]);
    }
}

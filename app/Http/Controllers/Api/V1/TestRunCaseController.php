<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\AddTestCaseToRun;
use App\Domain\QA\Actions\RemoveTestCaseFromRun;
use App\Domain\QA\Actions\ReorderTestRunCase;
use App\Http\Controllers\Controller;
use App\Http\Resources\TestRunCaseResource;
use App\Models\TestCase;
use App\Models\TestRun;
use App\Models\TestRunCase;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TestRunCaseController extends Controller
{
    use AuthorizesRequests;

    public function index(TestRun $run): JsonResponse
    {
        $this->authorize('view', $run);

        $runCases = $run->runCases()->with(['testCase.steps', 'execution.executor', 'creator'])->get();

        return response()->json([
            'success' => true,
            'message' => 'Test run cases retrieved successfully.',
            'data' => TestRunCaseResource::collection($runCases),
        ]);
    }

    public function store(Request $request, TestRun $run, AddTestCaseToRun $action): JsonResponse
    {
        $this->authorize('manageCases', $run);

        $validated = $request->validate([
            'test_case_id' => 'required|string|exists:test_cases,id',
        ]);

        $testCase = TestCase::findOrFail($validated['test_case_id']);
        $runCase = $action->execute($request->user(), $run, $testCase);
        $runCase->load(['testCase', 'execution']);

        return response()->json([
            'success' => true,
            'message' => 'Test case added to run successfully.',
            'data' => new TestRunCaseResource($runCase),
        ], 201);
    }

    public function destroy(Request $request, TestRun $run, string $caseId, RemoveTestCaseFromRun $action): JsonResponse
    {
        $this->authorize('manageCases', $run);

        $runCase = TestRunCase::where('test_run_id', $run->id)
            ->where(function ($q) use ($caseId) {
                $q->where('id', $caseId)->orWhere('test_case_id', $caseId);
            })
            ->first();

        if (!$runCase) {
            throw ValidationException::withMessages([
                'test_case_id' => ['The test case does not exist in this test run.'],
            ]);
        }

        $action->execute($request->user(), $run, $runCase);

        return response()->json([
            'success' => true,
            'message' => 'Test case removed from run successfully.',
            'data' => null,
        ]);
    }

    public function reorder(Request $request, TestRun $run, string $caseId, ReorderTestRunCase $action): JsonResponse
    {
        $this->authorize('manageCases', $run);

        $runCase = TestRunCase::where('test_run_id', $run->id)
            ->where(function ($q) use ($caseId) {
                $q->where('id', $caseId)->orWhere('test_case_id', $caseId);
            })
            ->first();

        if (!$runCase) {
            throw ValidationException::withMessages([
                'test_case_id' => ['The test case does not exist in this test run.'],
            ]);
        }

        $validated = $request->validate([
            'position' => 'required|integer|min:1',
        ]);

        $reordered = $action->execute($request->user(), $runCase, (int) $validated['position']);
        $reordered->load(['testCase', 'execution']);

        return response()->json([
            'success' => true,
            'message' => 'Test case reordered in run successfully.',
            'data' => new TestRunCaseResource($reordered),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\ExecuteTestCase;
use App\Domain\QA\Actions\ResetTestExecution;
use App\Http\Controllers\Controller;
use App\Http\Resources\TestExecutionResource;
use App\Models\TestCase;
use App\Models\TestExecution;
use App\Models\TestRun;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestExecutionController extends Controller
{
    use AuthorizesRequests;

    public function index(TestRun $run): JsonResponse
    {
        $this->authorize('viewAny', [TestExecution::class, $run]);

        $executions = TestExecution::where('test_run_id', $run->id)
            ->with(['executor', 'testCase.steps'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Test execution results retrieved successfully.',
            'data' => TestExecutionResource::collection($executions),
        ]);
    }

    public function execute(Request $request, TestRun $run, TestCase $case, ExecuteTestCase $action): JsonResponse
    {
        $this->authorize('execute', [TestExecution::class, $run]);

        $validated = $request->validate([
            'status' => 'required|in:not_run,passed,failed,blocked,skipped',
            'actual_result' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $execution = $action->execute($request->user(), $run, $case, $validated);
        $execution->load(['executor', 'testCase']);

        return response()->json([
            'success' => true,
            'message' => 'Test execution recorded successfully.',
            'data' => new TestExecutionResource($execution),
        ]);
    }

    public function reset(Request $request, TestRun $run, TestCase $case, ResetTestExecution $action): JsonResponse
    {
        $this->authorize('reset', [TestExecution::class, $run]);

        $execution = $action->execute($request->user(), $run, $case);
        $execution->load(['executor', 'testCase']);

        return response()->json([
            'success' => true,
            'message' => 'Test execution reset successfully.',
            'data' => new TestExecutionResource($execution),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\QA\Actions\AddTestStep;
use App\Domain\QA\Actions\DeleteTestStep;
use App\Domain\QA\Actions\ReorderTestStep;
use App\Domain\QA\Actions\UpdateTestStep;
use App\Http\Controllers\Controller;
use App\Http\Resources\TestStepResource;
use App\Models\TestCase;
use App\Models\TestStep;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TestStepController extends Controller
{
    use AuthorizesRequests;

    public function index(TestCase $case): JsonResponse
    {
        $this->authorize('view', $case);

        $steps = $case->steps;

        return response()->json([
            'success' => true,
            'message' => 'Test steps retrieved successfully.',
            'data' => TestStepResource::collection($steps),
        ]);
    }

    public function store(Request $request, TestCase $case, AddTestStep $action): JsonResponse
    {
        $this->authorize('manageSteps', $case);

        $validated = $request->validate([
            'action' => 'required|string',
            'expected_result' => 'nullable|string',
            'step_number' => 'nullable|integer|min:1',
        ]);

        $step = $action->execute($request->user(), $case, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Test step added successfully.',
            'data' => new TestStepResource($step),
        ], 201);
    }

    public function update(Request $request, TestCase $case, TestStep $step, UpdateTestStep $action): JsonResponse
    {
        $this->authorize('manageSteps', $case);

        if ($step->test_case_id !== $case->id) {
            throw ValidationException::withMessages([
                'step' => ['The step does not belong to the specified test case.'],
            ]);
        }

        $validated = $request->validate([
            'action' => 'sometimes|required|string',
            'expected_result' => 'nullable|string',
        ]);

        $updated = $action->execute($request->user(), $step, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Test step updated successfully.',
            'data' => new TestStepResource($updated),
        ]);
    }

    public function destroy(Request $request, TestCase $case, TestStep $step, DeleteTestStep $action): JsonResponse
    {
        $this->authorize('manageSteps', $case);

        if ($step->test_case_id !== $case->id) {
            throw ValidationException::withMessages([
                'step' => ['The step does not belong to the specified test case.'],
            ]);
        }

        $action->execute($request->user(), $step);

        return response()->json([
            'success' => true,
            'message' => 'Test step deleted successfully.',
            'data' => null,
        ]);
    }

    public function reorder(Request $request, TestCase $case, TestStep $step, ReorderTestStep $action): JsonResponse
    {
        $this->authorize('manageSteps', $case);

        if ($step->test_case_id !== $case->id) {
            throw ValidationException::withMessages([
                'step' => ['The step does not belong to the specified test case.'],
            ]);
        }

        $validated = $request->validate([
            'position' => 'required|integer|min:1',
        ]);

        $reordered = $action->execute($request->user(), $step, (int) $validated['position']);

        return response()->json([
            'success' => true,
            'message' => 'Test step reordered successfully.',
            'data' => new TestStepResource($reordered),
        ]);
    }
}

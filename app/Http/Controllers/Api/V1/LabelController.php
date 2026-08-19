<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Issue\Actions\AddOrganizationLabel;
use App\Domain\Issue\Actions\AttachIssueLabel;
use App\Domain\Issue\Actions\DeleteOrganizationLabel;
use App\Domain\Issue\Actions\DetachIssueLabel;
use App\Domain\Issue\Actions\UpdateOrganizationLabel;
use App\Http\Controllers\Controller;
use App\Http\Resources\LabelResource;
use App\Models\Issue;
use App\Models\Label;
use App\Models\Organization;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $labels = $organization->labels()->orderBy('name', 'asc')->get();

        return $this->successResponse(
            LabelResource::collection($labels),
            'Organization labels retrieved'
        );
    }

    public function store(Request $request, Organization $organization, AddOrganizationLabel $action): JsonResponse
    {
        $this->authorize('manage', [Label::class, $organization]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
        ]);

        $label = $action->execute(
            $request->user(),
            $organization,
            $validated['name'],
            $validated['color'] ?? '#6366f1'
        );

        return $this->successResponse(
            new LabelResource($label),
            'Label created successfully',
            201
        );
    }

    public function update(Request $request, Label $label, UpdateOrganizationLabel $action): JsonResponse
    {
        $this->authorize('update', $label);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'color' => ['sometimes', 'string', 'max:30'],
        ]);

        $updated = $action->execute($label, $validated);

        return $this->successResponse(
            new LabelResource($updated),
            'Label updated successfully'
        );
    }

    public function destroy(Label $label, DeleteOrganizationLabel $action): JsonResponse
    {
        $this->authorize('delete', $label);

        $action->execute($label);

        return $this->successResponse(null, 'Label deleted successfully');
    }

    public function attach(Issue $issue, Label $label, AttachIssueLabel $action): JsonResponse
    {
        $this->authorize('manageLabels', $issue);

        $action->execute(auth()->user(), $issue, $label);

        return $this->successResponse(null, 'Label attached to issue successfully');
    }

    public function detach(Issue $issue, Label $label, DetachIssueLabel $action): JsonResponse
    {
        $this->authorize('manageLabels', $issue);

        $action->execute(auth()->user(), $issue, $label);

        return $this->successResponse(null, 'Label detached from issue successfully');
    }
}

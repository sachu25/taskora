<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Project\Actions\CreateProject;
use App\Domain\Project\Actions\DeleteProject;
use App\Domain\Project\Actions\UpdateProject;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Organization;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $projects = $organization->projects()
            ->withCount('members')
            ->with('creator')
            ->get();

        return $this->successResponse(
            ProjectResource::collection($projects),
            'Projects retrieved successfully'
        );
    }

    public function store(Request $request, Organization $organization, CreateProject $action): JsonResponse
    {
        $this->authorize('createProject', $organization);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'key' => ['required', 'string', 'min:2', 'max:10'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:planned,active,on_hold,completed,archived'],
            'visibility' => ['nullable', 'string', 'in:private,organization'],
            'start_date' => ['nullable', 'date'],
            'target_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $project = $action->execute($request->user(), $organization, $validated);

        return $this->successResponse(
            new ProjectResource($project->loadCount('members')),
            'Project created successfully',
            201
        );
    }

    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->load(['creator', 'members.user'])->loadCount('members');

        return $this->successResponse(
            new ProjectResource($project),
            'Project details retrieved'
        );
    }

    public function update(Request $request, Project $project, UpdateProject $action): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'key' => ['sometimes', 'string', 'min:2', 'max:10'],
            'slug' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:planned,active,on_hold,completed,archived'],
            'visibility' => ['sometimes', 'string', 'in:private,organization'],
            'start_date' => ['nullable', 'date'],
            'target_date' => ['nullable', 'date'],
        ]);

        $updated = $action->execute($request->user(), $project, $validated);

        return $this->successResponse(
            new ProjectResource($updated->loadCount('members')),
            'Project updated successfully'
        );
    }

    public function destroy(Project $project, DeleteProject $action): JsonResponse
    {
        $this->authorize('delete', $project);

        $action->execute(auth()->user(), $project);

        return $this->successResponse(null, 'Project deleted successfully');
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Project\Actions\AddProjectMember;
use App\Domain\Project\Actions\RemoveProjectMember;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectMemberResource;
use App\Models\Project;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $members = $project->members()->with('user')->get();

        return $this->successResponse(
            ProjectMemberResource::collection($members),
            'Project members retrieved successfully'
        );
    }

    public function store(Request $request, Project $project, AddProjectMember $action): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $validated = $request->validate([
            'user_id' => ['required', 'string', 'exists:users,id'],
            'role' => ['nullable', 'string', 'in:project_manager,developer,tester,reporter,viewer'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);
        $role = $validated['role'] ?? 'developer';

        $member = $action->execute($request->user(), $project, $targetUser, $role);
        $member->load('user');

        return $this->successResponse(
            new ProjectMemberResource($member),
            'User added to project successfully',
            201
        );
    }

    public function destroy(Project $project, User $user, RemoveProjectMember $action): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $action->execute(auth()->user(), $project, $user);

        return $this->successResponse(null, 'User removed from project successfully');
    }
}

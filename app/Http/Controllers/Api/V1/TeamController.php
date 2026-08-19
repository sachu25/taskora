<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Team\Actions\CreateTeam;
use App\Domain\Team\Actions\DeleteTeam;
use App\Domain\Team\Actions\UpdateTeam;
use App\Http\Controllers\Controller;
use App\Http\Resources\TeamResource;
use App\Models\Organization;
use App\Models\Team;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $teams = $organization->teams()
            ->withCount('members')
            ->with('creator')
            ->get();

        return $this->successResponse(
            TeamResource::collection($teams),
            'Teams retrieved successfully'
        );
    }

    public function store(Request $request, Organization $organization, CreateTeam $action): JsonResponse
    {
        $this->authorize('createTeam', $organization);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $team = $action->execute($request->user(), $organization, $validated);

        return $this->successResponse(
            new TeamResource($team->loadCount('members')),
            'Team created successfully',
            201
        );
    }

    public function show(Team $team): JsonResponse
    {
        $this->authorize('view', $team);

        $team->load(['creator'])->loadCount('members');

        return $this->successResponse(
            new TeamResource($team),
            'Team details retrieved'
        );
    }

    public function update(Request $request, Team $team, UpdateTeam $action): JsonResponse
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $updated = $action->execute($request->user(), $team, $validated);

        return $this->successResponse(
            new TeamResource($updated),
            'Team updated successfully'
        );
    }

    public function destroy(Team $team, DeleteTeam $action): JsonResponse
    {
        $this->authorize('delete', $team);

        $action->execute(auth()->user(), $team);

        return $this->successResponse(null, 'Team deleted successfully');
    }
}

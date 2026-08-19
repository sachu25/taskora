<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Organization\Actions\CreateOrganization;
use App\Domain\Organization\Actions\UpdateOrganization;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $organizations = $request->user()->organizations;

        return $this->successResponse(
            OrganizationResource::collection($organizations),
            'Organizations retrieved successfully'
        );
    }

    public function store(Request $request, CreateOrganization $action): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:organizations,slug'],
            'description' => ['nullable', 'string'],
            'timezone' => ['nullable', 'string', 'max:100'],
        ]);

        $organization = $action->execute($request->user(), $validated);

        return $this->successResponse(
            new OrganizationResource($organization),
            'Organization created successfully',
            201
        );
    }

    public function show(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        return $this->successResponse(
            new OrganizationResource($organization),
            'Organization details retrieved'
        );
    }

    public function update(Request $request, Organization $organization, UpdateOrganization $action): JsonResponse
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:organizations,slug,' . $organization->id],
            'logo' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'timezone' => ['sometimes', 'string', 'max:100'],
            'status' => ['sometimes', 'string', 'in:active,suspended,archived'],
        ]);

        $updated = $action->execute($request->user(), $organization, $validated);

        return $this->successResponse(
            new OrganizationResource($updated),
            'Organization updated successfully'
        );
    }
}

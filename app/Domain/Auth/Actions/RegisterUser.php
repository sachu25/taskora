<?php

namespace App\Domain\Auth\Actions;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterUser
{
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'status' => 'active',
            ]);

            $orgName = $data['organization_name'];
            $baseSlug = Str::slug($orgName);
            $slug = $baseSlug ?: 'org';

            $count = Organization::where('slug', 'like', "{$slug}%")->count();
            if ($count > 0) {
                $slug .= '-' . Str::random(4);
            }

            $organization = Organization::create([
                'name' => $orgName,
                'slug' => $slug,
                'status' => 'active',
            ]);

            OrganizationMember::create([
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'role' => 'organization_admin',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            ActivityLogger::log(
                $organization->id,
                $user->id,
                'user.registered',
                "Registered user {$user->name} and created organization {$organization->name}",
                $organization
            );

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user,
                'organization' => $organization,
                'token' => $token,
            ];
        });
    }
}

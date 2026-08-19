<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TeamFactory extends Factory
{
    protected $model = Team::class;

    public function definition(): array
    {
        $name = fake()->jobTitle() . ' Team';
        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(4),
            'description' => fake()->sentence(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $name = fake()->catchPhrase();
        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'key' => strtoupper(Str::random(3)),
            'slug' => Str::slug($name) . '-' . Str::random(4),
            'description' => fake()->paragraph(),
            'status' => 'active',
            'visibility' => 'organization',
            'start_date' => now()->toDateString(),
            'target_date' => now()->addMonths(3)->toDateString(),
        ];
    }
}

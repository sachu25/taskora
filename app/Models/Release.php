<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Release extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'project_id',
        'name',
        'version',
        'description',
        'status',
        'start_date',
        'release_date',
        'released_at',
        'created_by',
        'release_manager_id',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'release_date' => 'date:Y-m-d',
        'released_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function releaseManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'release_manager_id');
    }

    public function releaseIssues(): HasMany
    {
        return $this->hasMany(ReleaseIssue::class, 'release_id');
    }

    public function issues(): BelongsToMany
    {
        return $this->belongsToMany(Issue::class, 'release_issues')
            ->withPivot(['id', 'added_by', 'created_at']);
    }

    public function isPlanned(): bool
    {
        return $this->status === 'planned';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isReleased(): bool
    {
        return $this->status === 'released';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }
}

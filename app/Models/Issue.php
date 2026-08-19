<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Issue extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'project_id',
        'issue_number',
        'issue_type',
        'title',
        'description',
        'status',
        'priority',
        'severity',
        'reporter_id',
        'assignee_id',
        'parent_id',
        'backlog_position',
    ];

    protected $casts = [
        'backlog_position' => 'integer',
    ];

    protected $appends = ['key'];

    public function key(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->project ? "{$this->project->key}-{$this->issue_number}" : null
        );
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Issue::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Issue::class, 'parent_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(IssueComment::class);
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'issue_labels')
            ->withPivot('created_at');
    }

    public function watchers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'issue_watchers')
            ->withPivot('created_at');
    }

    public function links(): HasMany
    {
        return $this->hasMany(IssueLink::class, 'issue_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(IssueAttachment::class);
    }

    public function sprintIssues(): HasMany
    {
        return $this->hasMany(SprintIssue::class, 'issue_id');
    }

    public function sprints(): BelongsToMany
    {
        return $this->belongsToMany(Sprint::class, 'sprint_issues')
            ->withPivot(['id', 'added_by', 'position', 'added_at'])
            ->withTimestamps();
    }

    public function testCases(): BelongsToMany
    {
        return $this->belongsToMany(TestCase::class, 'test_case_issues', 'issue_id', 'test_case_id')
            ->withPivot(['created_by', 'created_at']);
    }

    public function releaseIssues(): HasMany
    {
        return $this->hasMany(ReleaseIssue::class, 'issue_id');
    }

    public function releases(): BelongsToMany
    {
        return $this->belongsToMany(Release::class, 'release_issues')
            ->withPivot(['id', 'added_by', 'created_at']);
    }
}

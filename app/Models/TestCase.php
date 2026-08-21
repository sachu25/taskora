<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TestCase extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'project_id',
        'suite_id',
        'case_number',
        'title',
        'description',
        'preconditions',
        'test_type',
        'priority',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $appends = ['key'];

    public function getKeyAttribute(): string
    {
        $prefix = $this->project ? $this->project->key : 'WEB';
        return 'TC-' . $prefix . '-' . str_pad((string) $this->case_number, 3, '0', STR_PAD_LEFT);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function suite(): BelongsTo
    {
        return $this->belongsTo(TestSuite::class, 'suite_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(TestStep::class, 'test_case_id')->orderBy('step_number', 'asc');
    }

    public function issues(): BelongsToMany
    {
        return $this->belongsToMany(Issue::class, 'test_case_issues', 'test_case_id', 'issue_id')
            ->withPivot(['created_by', 'created_at']);
    }

    public function runCases(): HasMany
    {
        return $this->hasMany(TestRunCase::class, 'test_case_id');
    }

    /**
     * Retrieve the model for a bound route value (supports ULID id, TC Key like TC-WEB-001, or case_number).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where(function ($query) use ($value) {
            $query->where('id', $value);

            if (str_contains($value, 'TC-')) {
                $num = (int) preg_replace('/[^0-9]/', '', $value);
                if ($num > 0) {
                    $query->orWhere('case_number', $num);
                }
            } elseif (is_numeric($value)) {
                $query->orWhere('case_number', (int) $value);
            }
        })->firstOrFail();
    }
}

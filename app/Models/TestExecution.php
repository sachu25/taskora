<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestExecution extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'organization_id',
        'test_run_id',
        'test_case_id',
        'test_run_case_id',
        'status',
        'executed_by',
        'executed_at',
        'actual_result',
        'notes',
    ];

    protected $casts = [
        'executed_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(TestRun::class, 'test_run_id');
    }

    public function testCase(): BelongsTo
    {
        return $this->belongsTo(TestCase::class, 'test_case_id');
    }

    public function runCase(): BelongsTo
    {
        return $this->belongsTo(TestRunCase::class, 'test_run_case_id');
    }

    public function executor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by');
    }
}

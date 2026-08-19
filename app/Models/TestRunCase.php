<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TestRunCase extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'test_run_id',
        'test_case_id',
        'position',
        'created_by',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(TestRun::class, 'test_run_id');
    }

    public function testCase(): BelongsTo
    {
        return $this->belongsTo(TestCase::class, 'test_case_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function execution(): HasOne
    {
        return $this->hasOne(TestExecution::class, 'test_run_case_id');
    }
}

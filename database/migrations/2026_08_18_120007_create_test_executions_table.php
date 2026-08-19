<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_executions', function (Blueprint $table) {
            $table->string('id', 26)->primary();
            $table->string('organization_id', 26);
            $table->string('test_run_id', 26);
            $table->string('test_case_id', 26);
            $table->string('test_run_case_id', 26);
            $table->enum('status', ['not_run', 'passed', 'failed', 'blocked', 'skipped'])->default('not_run');
            $table->string('executed_by', 26)->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->text('actual_result')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('test_run_id')->references('id')->on('test_runs')->onDelete('cascade');
            $table->foreign('test_case_id')->references('id')->on('test_cases')->onDelete('cascade');
            $table->foreign('test_run_case_id')->references('id')->on('test_run_cases')->onDelete('cascade');
            $table->foreign('executed_by')->references('id')->on('users')->onDelete('set null');

            $table->unique('test_run_case_id');

            $table->index('organization_id');
            $table->index('test_run_id');
            $table->index('test_case_id');
            $table->index('test_run_case_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_executions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_cases', function (Blueprint $table) {
            $table->string('id', 26)->primary();
            $table->string('organization_id', 26);
            $table->string('project_id', 26);
            $table->string('suite_id', 26)->nullable();
            $table->unsignedInteger('case_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('preconditions')->nullable();
            $table->enum('test_type', [
                'functional',
                'regression',
                'smoke',
                'integration',
                'acceptance',
                'usability',
                'performance',
                'security',
            ])->default('functional');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['draft', 'ready', 'deprecated'])->default('ready');
            $table->string('created_by', 26);
            $table->string('updated_by', 26)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('suite_id')->references('id')->on('test_suites')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            $table->unique(['project_id', 'case_number']);

            $table->index('organization_id');
            $table->index('project_id');
            $table->index('suite_id');
            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'priority']);
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_cases');
    }
};

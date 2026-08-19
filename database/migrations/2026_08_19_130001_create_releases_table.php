<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('releases', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignUlid('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('name');
            $table->string('version');
            $table->text('description')->nullable();
            $table->enum('status', ['planned', 'in_progress', 'released', 'cancelled'])->default('planned');
            $table->date('start_date')->nullable();
            $table->date('release_date')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->foreignUlid('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignUlid('release_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'version', 'deleted_at']);
            $table->index('organization_id');
            $table->index('project_id');
            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'release_date']);
            $table->index('created_by');
            $table->index('release_manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('releases');
    }
};

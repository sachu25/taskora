<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issue_links', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignUlid('issue_id')->constrained('issues')->cascadeOnDelete();
            $table->foreignUlid('linked_issue_id')->constrained('issues')->cascadeOnDelete();
            $table->string('link_type'); // blocks, blocked_by, duplicates, duplicated_by, relates_to
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['issue_id', 'linked_issue_id', 'link_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_links');
    }
};

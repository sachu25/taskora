<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issue_labels', function (Blueprint $table) {
            $table->foreignUlid('issue_id')->constrained('issues')->cascadeOnDelete();
            $table->foreignUlid('label_id')->constrained('labels')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['issue_id', 'label_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_labels');
    }
};

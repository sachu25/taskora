<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_steps', function (Blueprint $table) {
            $table->string('id', 26)->primary();
            $table->string('test_case_id', 26);
            $table->unsignedInteger('step_number');
            $table->text('action');
            $table->text('expected_result')->nullable();
            $table->timestamps();

            $table->foreign('test_case_id')->references('id')->on('test_cases')->onDelete('cascade');

            $table->unique(['test_case_id', 'step_number']);
            $table->index('test_case_id');
            $table->index(['test_case_id', 'step_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_steps');
    }
};

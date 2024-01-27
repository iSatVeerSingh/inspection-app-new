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
        Schema::create('jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('active')->default(true)->index();
            $table->string('jobNumber')->unique();
            $table->foreignUuid('category_id')->nullable()->constrained('job_categories');
            $table->foreignUuid('customer_id')->constrained('customers');
            $table->foreignUuid('inspector_id')->nullable()->constrained('users');
            $table->dateTime('startsAt')->nullable();
            $table->string('siteAddress');
            $table->string('status')->index();
            $table->dateTime('completedAt')->nullable()->index();
            $table->text('description')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};

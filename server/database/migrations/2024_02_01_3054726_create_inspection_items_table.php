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
        Schema::create('inspection_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->nullable();
            $table->foreignUuid('report_id')->constrained('reports');
            $table->foreignUuid('library_item_id')->nullable()->constrained('items');
            $table->json('images')->nullable();
            $table->text('note')->nullable();
            $table->integer('height', false, true)->default(0);

            $table->boolean('custom')->default(false);
            $table->boolean('previousItem')->default(false);

            $table->text('openingParagraph')->nullable();
            $table->text('closingParagraph')->nullable();
            $table->longText('embeddedImage')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_items');
    }
};

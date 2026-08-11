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
        Schema::create('product_media', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id')->nullable(); // Depending on product id type
            $table->string('url');
            $table->string('type')->default('image'); // image, video
            $table->string('resolution')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id')->nullable();
            $table->string('attribute_name'); // e.g. Color, Size
            $table->string('attribute_value');
            $table->decimal('price_adjustment', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_media');
    }
};

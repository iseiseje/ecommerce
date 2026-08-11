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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'slug')) {
                $table->string('slug')->nullable()->unique();
            }
            if (!Schema::hasColumn('products', 'category_id')) {
                $table->uuid('category_id')->nullable();
                $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            }
            if (!Schema::hasColumn('products', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
        
        try {
            \Illuminate\Support\Facades\DB::statement("NOTIFY pgrst, 'reload schema'");
        } catch (\Exception $e) {
            // Ignore if pgsql is not used or pgrst fails
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['slug', 'category_id', 'is_active']);
        });
        
        try {
            \Illuminate\Support\Facades\DB::statement("NOTIFY pgrst, 'reload schema'");
        } catch (\Exception $e) {
        }
    }
};


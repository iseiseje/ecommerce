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
        // Fix column type mismatch between order_items (bigint) and orders (uuid)
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('order_id');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->uuid('order_id');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
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
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropColumn('order_id');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('order_id');
        });
        
        try {
            \Illuminate\Support\Facades\DB::statement("NOTIFY pgrst, 'reload schema'");
        } catch (\Exception $e) {
        }
    }
};


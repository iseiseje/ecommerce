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
        // Add fields to 'products' if they don't exist
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('products', 'discount_price')) {
                    $table->decimal('discount_price', 10, 2)->nullable();
                }
                if (!Schema::hasColumn('products', 'stock')) {
                    $table->integer('stock')->default(0);
                }
                if (!Schema::hasColumn('products', 'rating')) {
                    $table->decimal('rating', 3, 2)->default(0);
                }
                if (!Schema::hasColumn('products', 'reviews_count')) {
                    $table->integer('reviews_count')->default(0);
                }
            });
        }

        // Add fields to 'users'
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url')->nullable();
            }
            if (!Schema::hasColumn('users', 'phone_number')) {
                $table->string('phone_number')->nullable();
            }
            if (!Schema::hasColumn('users', 'is_verified')) {
                $table->boolean('is_verified')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn([
                    'description',
                    'discount_price',
                    'stock',
                    'rating',
                    'reviews_count'
                ]);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_url', 'phone_number', 'is_verified']);
        });
    }
};

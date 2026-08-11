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
        // Update promos table
        if (Schema::hasTable('promos')) {
            Schema::table('promos', function (Blueprint $table) {
                if (!Schema::hasColumn('promos', 'action_type')) {
                    $table->string('action_type')->nullable(); // link, product, category
                }
                if (!Schema::hasColumn('promos', 'action_value')) {
                    $table->string('action_value')->nullable();
                }
            });
        }

        if (!Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('discount_type')->default('percent'); // percent, nominal, free_shipping
                $table->decimal('discount_value', 10, 2);
                $table->decimal('min_purchase', 10, 2)->default(0);
                $table->decimal('max_discount', 10, 2)->nullable();
                $table->dateTime('valid_from')->nullable();
                $table->dateTime('valid_until')->nullable();
                $table->integer('usage_limit')->nullable();
                $table->integer('used_count')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('flash_sales')) {
            Schema::create('flash_sales', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->dateTime('start_time');
                $table->dateTime('end_time');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('flash_sale_items')) {
            Schema::create('flash_sale_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('flash_sale_id');
                $table->uuid('product_id')->nullable();
                $table->decimal('flash_sale_price', 10, 2);
                $table->integer('stock_allocated')->default(0);
                $table->integer('stock_sold')->default(0);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flash_sale_items');
        Schema::dropIfExists('flash_sales');
        Schema::dropIfExists('coupons');
        
        if (Schema::hasTable('promos')) {
            Schema::table('promos', function (Blueprint $table) {
                $table->dropColumn(['action_type', 'action_value']);
            });
        }
    }
};

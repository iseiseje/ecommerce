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
        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->uuid('user_id')->nullable();
                $table->string('label')->nullable(); // Home, Office
                $table->text('full_address');
                $table->string('latitude')->nullable();
                $table->string('longitude')->nullable();
                $table->boolean('is_primary')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->uuid('user_id')->nullable();
                $table->string('status')->default('Menunggu Pembayaran');
                $table->decimal('total_amount', 12, 2)->default(0);
                $table->string('tracking_number')->nullable();
                $table->unsignedBigInteger('shipping_address_id')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'tracking_number')) {
                    $table->string('tracking_number')->nullable();
                }
                if (!Schema::hasColumn('orders', 'shipping_address_id')) {
                    $table->unsignedBigInteger('shipping_address_id')->nullable();
                }
            });
        }

        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->uuid('product_id')->nullable();
                $table->unsignedBigInteger('variant_id')->nullable();
                $table->integer('quantity')->default(1);
                $table->decimal('price', 10, 2);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('wishlists')) {
            Schema::create('wishlists', function (Blueprint $table) {
                $table->id();
                $table->uuid('user_id')->nullable();
                $table->uuid('product_id')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->id();
                $table->uuid('user_id')->nullable();
                $table->uuid('product_id')->nullable();
                $table->unsignedBigInteger('variant_id')->nullable();
                $table->integer('quantity')->default(1);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('user_addresses');
    }
};

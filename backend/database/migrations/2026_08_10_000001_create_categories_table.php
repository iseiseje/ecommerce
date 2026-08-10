<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->default('🏷️');
            $table->timestamp('created_at')->useCurrent();
        });

        // Seed Kategori Produk Awal (Tanpa 'Semua')
        $categories = [
            ['name' => 'Nike', 'slug' => 'nike', 'icon' => '✔️'],
            ['name' => 'Adidas', 'slug' => 'adidas', 'icon' => '👟'],
            ['name' => 'Puma', 'slug' => 'puma', 'icon' => '🐆'],
            ['name' => 'Rolex', 'slug' => 'rolex', 'icon' => '⌚'],
            ['name' => 'Gucci', 'slug' => 'gucci', 'icon' => '👜'],
            ['name' => 'Elektronik', 'slug' => 'electronics', 'icon' => '📱'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->insertOrIgnore([
                'id' => (string) Str::uuid(),
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'icon' => $cat['icon'],
                'created_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Semua', 'slug' => 'all', 'icon' => '🔥'],
            ['name' => 'Nike', 'slug' => 'nike', 'icon' => '✔️'],
            ['name' => 'Adidas', 'slug' => 'adidas', 'icon' => '👟'],
            ['name' => 'Puma', 'slug' => 'puma', 'icon' => '🐆'],
            ['name' => 'Rolex', 'slug' => 'rolex', 'icon' => '⌚'],
            ['name' => 'Gucci', 'slug' => 'gucci', 'icon' => '👜'],
            ['name' => 'Elektronik', 'slug' => 'electronics', 'icon' => '📱'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $cat['name'],
                    'icon' => $cat['icon'],
                ]
            );
        }
    }
}

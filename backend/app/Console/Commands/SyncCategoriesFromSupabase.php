<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Category;

class SyncCategoriesFromSupabase extends Command
{
    /**
     * Nama dan signature perintah artisan
     */
    protected $signature = 'categories:sync';

    /**
     * Deskripsi perintah artisan
     */
    protected $description = 'Sinkronisasi daftar kategori dari Supabase ke database Laravel VPS';

    /**
     * Eksekusi perintah
     */
    public function handle()
    {
        $this->info('Mengambil data kategori terbaru dari Supabase...');

        $supabaseUrl = env('SUPABASE_URL');
        $supabaseKey = env('SUPABASE_ANON_KEY') ?: env('SUPABASE_SERVICE_ROLE_KEY');

        if (empty($supabaseUrl) || empty($supabaseKey)) {
            $this->error('ERROR: SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di file .env VPS!');
            return 1;
        }

        try {
            $response = Http::withHeaders([
                'apikey' => $supabaseKey,
                'Authorization' => 'Bearer ' . $supabaseKey,
            ])->get("{$supabaseUrl}/rest/v1/categories?select=*&slug=neq.all");

            if ($response->failed()) {
                $this->error('Gagal mengambil data dari Supabase: ' . $response->body());
                return 1;
            }

            $categories = $response->json();
            $count = 0;

            foreach ($categories as $cat) {
                Category::withoutEvents(function () use ($cat) {
                    Category::updateOrCreate(
                        ['slug' => $cat['slug']],
                        [
                            'id' => $cat['id'],
                            'name' => $cat['name'],
                            'icon' => $cat['icon'] ?? '🏷️',
                        ]
                    );
                });
                $count++;
            }

            $this->info("Berhasil menyinkronkan {$count} kategori dari Supabase ke VPS!");
            return 0;
        } catch (\Exception $e) {
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
            return 1;
        }
    }
}

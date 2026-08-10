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

        $supabaseUrl = env('SUPABASE_URL', 'https://axkgduqdqwnyvhzpkrnj.supabase.co');
        $supabaseKey = env('SUPABASE_ANON_KEY', 'sb_publishable_fc5hf1S68TiQPg4tMbh3-A_vF6oCUkN');

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

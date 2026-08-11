<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SyncSupabaseUsers extends Command
{
    protected $signature = 'supabase:sync-users';
    protected $description = 'Sync users from Supabase auth.users to local users table';

    public function handle()
    {
        $this->info('Fetching users from Supabase auth.users...');
        
        try {
            $supabaseUsers = DB::connection('pgsql')->select('SELECT * FROM auth.users');
        } catch (\Exception $e) {
            $this->error('Could not fetch from auth.users. Make sure your database user has permissions.');
            $this->error($e->getMessage());
            return;
        }

        $count = 0;
        foreach ($supabaseUsers as $authUser) {
            if (empty($authUser->email)) {
                continue;
            }

            // Handle raw_user_meta_data
            $meta = json_decode($authUser->raw_user_meta_data ?? '{}', true);
            
            $name = $meta['name'] ?? $meta['full_name'] ?? explode('@', $authUser->email)[0];
            $avatar_url = $meta['avatar_url'] ?? null;
            $phone_number = $authUser->phone ?? null;
            
            $user = User::where('email', $authUser->email)->first();
            if (!$user) {
                $user = new User();
                $user->email = $authUser->email;
                $user->password = Hash::make(Str::random(24));
            }
            
            $user->name = $name;
            $user->avatar_url = $avatar_url;
            $user->phone_number = $phone_number;
            $user->is_verified = !empty($authUser->email_confirmed_at);
            
            $user->save();
            $count++;
        }

        $this->info("Successfully synced {$count} users from Supabase!");
    }
}

<?php
use Illuminate\Support\Facades\DB;

try {
    DB::statement('ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;');
    DB::statement('CREATE POLICY "Public promos are viewable by everyone" ON public.promos FOR SELECT USING (true);');
    DB::statement('ALTER PUBLICATION supabase_realtime ADD TABLE public.promos;');
    echo "Promos RLS and Realtime configured successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

<?php
use Illuminate\Support\Facades\DB;
$rls = DB::select("SELECT relrowsecurity FROM pg_class WHERE relname = 'categories'");
var_dump($rls);

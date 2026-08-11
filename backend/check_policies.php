<?php
use Illuminate\Support\Facades\DB;
$policies = DB::select("SELECT * FROM pg_policies WHERE tablename = 'categories'");
var_dump($policies);

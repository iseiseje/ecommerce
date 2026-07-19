<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\TextInput::make('user_id')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('amount')
                    ->required()
                    ->numeric(),
                \Filament\Forms\Components\TextInput::make('status')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('checkout_url')
                    ->url()
                    ->maxLength(255),
            ]);
    }
}

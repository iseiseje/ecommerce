<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\Select::make('category_id')
                    ->relationship('category', 'name')
                    ->nullable(),
                \Filament\Forms\Components\TextInput::make('slug')
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('genlook_external_id')
                    ->label('Genlook ID')
                    ->maxLength(255)
                    ->nullable(),
                \Filament\Forms\Components\TextInput::make('price')
                    ->required()
                    ->numeric(),
                \Filament\Forms\Components\TextInput::make('discount_price')
                    ->numeric()
                    ->nullable(),
                \Filament\Forms\Components\TextInput::make('stock')
                    ->numeric()
                    ->default(0),
                \Filament\Forms\Components\Textarea::make('description')
                    ->columnSpanFull(),
                \Filament\Forms\Components\TextInput::make('image_url')
                    ->label('Primary Image URL')
                    ->url()
                    ->maxLength(255),
                \Filament\Forms\Components\Toggle::make('is_active')
                    ->default(true),
            ]);
    }
}

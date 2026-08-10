<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\TextInput::make('name')
                    ->label('Nama Kategori')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('icon')
                    ->label('Ikon / Emoji')
                    ->default('🏷️')
                    ->maxLength(10),
                \Filament\Forms\Components\TextInput::make('slug')
                    ->label('Slug')
                    ->placeholder('Otomatis dari nama (ex: nike, adidas)'),
            ]);
    }
}
